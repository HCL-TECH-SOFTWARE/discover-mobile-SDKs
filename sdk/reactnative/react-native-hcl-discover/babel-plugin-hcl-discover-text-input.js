module.exports = function hclDiscoverTextInputPlugin(api) {
  const t = api.types;

  return {
    name: 'hcl-discover-text-input',

    visitor: {
      ImportDeclaration(path, state) {
        const filename = state.file.opts.filename || '';

        // Never transform the SDK's own source.
        if (
          filename.includes('/react-native-hcl-discover/') ||
          filename.includes('\\react-native-hcl-discover\\') ||
          filename.includes('/node_modules/')
        ) {
          return;
        }

        if (path.node.source.value !== 'react-native') {
          return;
        }

        const originalSpecifiers = path.node.specifiers;
        const replacementSpecifiers = [];

        for (const specifier of originalSpecifiers) {
          if (
            t.isImportSpecifier(specifier) &&
            t.isIdentifier(specifier.imported, {
              name: 'TextInput',
            })
          ) {
            replacementSpecifiers.push(
              t.importSpecifier(
                t.cloneNode(specifier.local),
                t.identifier('HCLDiscoverTextInput')
              )
            );
          } else {
            // Keep View, ScrollView, and other imports unchanged.
            replacementSpecifiers.push(specifier);
          }
        }

        if (
          replacementSpecifiers.length === originalSpecifiers.length
        ) {
          return;
        }

        const textInputSpecifiers =
          replacementSpecifiers.filter(
            (specifier) =>
              t.isImportSpecifier(specifier) &&
              t.isIdentifier(specifier.imported, {
                name: 'HCLDiscoverTextInput',
              })
          );

        const otherSpecifiers =
          replacementSpecifiers.filter(
            (specifier) => !textInputSpecifiers.includes(specifier)
          );

        if (textInputSpecifiers.length > 0) {
          const wrappedImport = t.importDeclaration(
            textInputSpecifiers,
            t.stringLiteral('react-native-hcl-discover')
          );

          path.insertBefore(wrappedImport);
        }

        if (otherSpecifiers.length > 0) {
          path.node.specifiers = otherSpecifiers;
        } else {
          path.remove();
        }
      },
    },
  };
};