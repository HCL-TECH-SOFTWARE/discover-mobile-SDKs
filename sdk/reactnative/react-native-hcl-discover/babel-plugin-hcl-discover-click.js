module.exports = function ({ types: t }) {
  const supportedComponents = new Set([
    'Pressable',
    'TouchableOpacity',
    'TouchableHighlight',
    'TouchableWithoutFeedback',
    'Button',
  ]);

  function getJSXName(name) {
    if (t.isJSXIdentifier(name)) {
      return name.name;
    }

    return null;
  }

 function extractTextExpressions(children, t) {
    const expressions = [];

    children.forEach(child => {
        if (t.isJSXText(child)) {
            const value = child.value.replace(/\s+/g, ' ').trim();

            if (value) {
                expressions.push(t.stringLiteral(value));
            }
        } else if (t.isJSXExpressionContainer(child)) {
            const expression = child.expression;

            if (!t.isJSXEmptyExpression(expression)) {
                expressions.push(expression);
            }
        } else if (t.isJSXElement(child)) {
            expressions.push(
                ...extractTextExpressions(child.children, t)
            );
        }
    });

    return expressions;
}

  function extractExpressionText(expression) {
    if (t.isStringLiteral(expression) || t.isNumericLiteral(expression)) {
      return String(expression.value);
    }

    if (t.isConditionalExpression(expression)) {
      return (
        extractExpressionText(expression.consequent) ||
        extractExpressionText(expression.alternate)
      );
    }

    return '';
  }

  function getAttribute(openingElement, name) {
    return openingElement.attributes.find(
      attribute =>
        t.isJSXAttribute(attribute) &&
        attribute.name.name === name
    );
  }

    function instrumentAlertButtons(path, t) {
        const args = path.node.arguments;

        // Alert.alert(title, message, buttons)
        if (args.length < 3 || !t.isArrayExpression(args[2])) {
            return;
        }

        const buttons = args[2];

        buttons.elements.forEach((button) => {
            if (!t.isObjectExpression(button)) {
                return;
            }

            const textProperty = button.properties.find(
                (prop) =>
                    t.isObjectProperty(prop) &&
                    !prop.computed &&
                    (
                        t.isIdentifier(prop.key, { name: 'text' }) ||
                        t.isStringLiteral(prop.key, { value: 'text' })
                    )
            );

            const onPressProperty = button.properties.find(
                (prop) =>
                    t.isObjectProperty(prop) &&
                    !prop.computed &&
                    (
                        t.isIdentifier(prop.key, { name: 'onPress' }) ||
                        t.isStringLiteral(prop.key, { value: 'onPress' })
                    )
            );

            if (!onPressProperty) {
                return;
            }

            const originalCallback = onPressProperty.value;

            if (
                !t.isFunctionExpression(originalCallback) &&
                !t.isArrowFunctionExpression(originalCallback)
            ) {
                // Identifier and other callback expressions are supported too.
                // Only skip non-function literal values.
                if (
                    t.isNullLiteral(originalCallback) ||
                    t.isStringLiteral(originalCallback) ||
                    t.isNumericLiteral(originalCallback) ||
                    t.isBooleanLiteral(originalCallback)
                ) {
                    return;
                }
            }

            const buttonText = textProperty
                ? t.cloneNode(textProperty.value, true)
                : t.stringLiteral('');

          const testIDProperty = button.properties.find(
            (prop) =>
              t.isObjectProperty(prop) &&
              !prop.computed &&
              (
                t.isIdentifier(prop.key, { name: 'testID' }) ||
                t.isStringLiteral(prop.key, { value: 'testID' })
              )
          );

          const testID = testIDProperty
            ? t.cloneNode(testIDProperty.value, true)
            : t.stringLiteral('');

            const metadata = t.objectExpression([
                t.objectProperty(
                    t.identifier('buttonText'),
                    buttonText
                ),
                t.objectProperty(
                    t.identifier('accessibilityLabel'),
                    t.cloneNode(buttonText, true)
                ),
                t.objectProperty(
                    t.identifier('accessibilityRole'),
                    t.stringLiteral('button')
                ),
                t.objectProperty(
                    t.identifier('componentType'),
                    t.stringLiteral('Alert')
                ),
                t.objectProperty(
                  t.identifier('testID'),
                  testID
                ),
            ]);

            const argsId = path.scope.generateUidIdentifier('args');

            const trackerCall = t.expressionStatement(
                t.callExpression(
                    t.optionalMemberExpression(
                        t.identifier('globalThis'),
                        t.identifier('__HCL_DISCOVER_TRACK_CLICK__'),
                        false,
                        true
                    ),
                    [metadata]
                )
            );

            const wrappedCallback = t.arrowFunctionExpression(
                [t.restElement(argsId)],
                t.blockStatement([
                    t.tryStatement(
                        t.blockStatement([trackerCall]),
                        t.catchClause(
                            null,
                            t.blockStatement([])
                        )
                    ),
                    t.returnStatement(
                        t.callExpression(
                            t.cloneNode(originalCallback, true),
                            [
                                t.spreadElement(
                                    t.cloneNode(argsId)
                                )
                            ]
                        )
                    ),
                ])
            );

            onPressProperty.value = wrappedCallback;
        });
    }

  return {
    name: 'hcl-discover-click',

    visitor: {
      JSXOpeningElement(path) {
        const componentName = getJSXName(
          path.node.name
        );

        if (!supportedComponents.has(componentName)) {
          return;
        }

        const elementPath = path.parentPath;

        if (!elementPath.isJSXElement()) {
          return;
        }

        const openingElement = path.node;

        // Avoid modifying components without an onPress.
        const onPressAttribute = getAttribute(
          openingElement,
          'onPress'
        );

        if (
          !onPressAttribute ||
          !t.isJSXExpressionContainer(
            onPressAttribute.value
          )
        ) {
          return;
        }

        const originalCallback =
          onPressAttribute.value.expression;

        if (
          t.isNullLiteral(originalCallback) ||
          t.isBooleanLiteral(originalCallback)
        ) {
          return;
        }

        // Avoid wrapping the same callback more than once.
        if (openingElement.__hclDiscoverInstrumented) {
          return;
        }

        openingElement.__hclDiscoverInstrumented = true;

        const textExpressions = extractTextExpressions(
          elementPath.node.children,
          t
        );

        const buttonTextExpression = t.callExpression(
          t.memberExpression(
            t.arrayExpression(textExpressions),
            t.identifier('join')
          ),
          [t.stringLiteral('')]
        );

        const accessibilityLabel =
          getAttribute(openingElement, 'accessibilityLabel');

        const labelExpression =
          accessibilityLabel &&
          t.isJSXExpressionContainer(accessibilityLabel.value)
            ? accessibilityLabel.value.expression
            : accessibilityLabel &&
                t.isStringLiteral(accessibilityLabel.value)
              ? t.stringLiteral(accessibilityLabel.value.value)
              : t.stringLiteral('');

        const testIDAttribute = getAttribute(openingElement, 'testID');

        const testIDExpression =
          testIDAttribute &&
            t.isJSXExpressionContainer(testIDAttribute.value)
            ? testIDAttribute.value.expression
            : testIDAttribute &&
              t.isStringLiteral(testIDAttribute.value)
              ? t.stringLiteral(testIDAttribute.value.value)
              : t.stringLiteral('');

        const eventParam = path.scope.generateUidIdentifier(
          'event'
        );

        const metadata = t.objectExpression([
          t.objectProperty(
            t.identifier('buttonText'),
            buttonTextExpression
          ),
          t.objectProperty(
            t.identifier('componentType'),
            t.stringLiteral(componentName)
          ),
          t.objectProperty(
            t.identifier('accessibilityLabel'),
            labelExpression
          ),
          t.objectProperty(
            t.identifier('testID'),
            testIDExpression
          ),
        ]);

        const trackerCall = t.expressionStatement(
          t.callExpression(
            t.optionalMemberExpression(
              t.identifier('globalThis'),
              t.identifier('__HCL_DISCOVER_TRACK_CLICK__'),
              false,
              true
            ),
            [metadata]
          )
        );

        const callbackCall = t.ifStatement(
          t.binaryExpression(
            '===',
            t.unaryExpression(
              'typeof',
              t.cloneNode(originalCallback)
            ),
            t.stringLiteral('function')
          ),
          t.returnStatement(
            t.callExpression(
              t.cloneNode(originalCallback),
              [t.cloneNode(eventParam)]
            )
          )
        );

        onPressAttribute.value = t.jsxExpressionContainer(
          t.arrowFunctionExpression(
            [eventParam],
            t.blockStatement([
              trackerCall,
              callbackCall,
            ])
          )
        );
      },
        CallExpression(path) {
            const { callee } = path.node;
            const t = require('@babel/types');

            if (
                t.isMemberExpression(callee) &&
                !callee.computed &&
                t.isIdentifier(callee.object, { name: 'Alert' }) &&
                t.isIdentifier(callee.property, { name: 'alert' })
            ) {
                instrumentAlertButtons(path, t);
            }
        },
    },
  };
};