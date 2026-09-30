/*

Copyright 2024-2025 HCL Software

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

package com.hcldiscover;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.UiThreadUtil;
import com.facebook.react.module.annotations.ReactModule;


import java.io.ByteArrayOutputStream;
import java.lang.reflect.Method;
import java.util.Base64;

import android.app.Activity;
import android.graphics.Bitmap;
import android.graphics.Paint;
import android.graphics.RenderEffect;
import android.graphics.Shader;
import android.os.Build;
import android.view.View;
import android.renderscript.Allocation;
import android.renderscript.Element;
import android.renderscript.RenderScript;
import android.renderscript.ScriptIntrinsicBlur;
import android.content.Context;
import android.graphics.Canvas;

@ReactModule(name = HclDiscoverModule.NAME)
public class HclDiscoverModule extends ReactContextBaseJavaModule {
  public static final String NAME = "HclDiscover";

  public HclDiscoverModule(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  @Override
  @NonNull
  public String getName() {
    return NAME;
  }

  /**
   * 
   * @param smallBitmap
   * @param radius
   * @return
   * 
   * Method takes a bitmap and Gaussian blur window radius
   * It first converts 16 bit image format to 24 bits
   * Then applies blur to the image using blur radius
   * Finally returns blurred image back to the caller
   */

   public Bitmap blurRenderScript(Bitmap smallBitmap, double radius) {

    Context context = getReactApplicationContext().getApplicationContext();

       if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
           try {
               // Use reflection to call Paint.setRenderEffect if available
               Bitmap output = Bitmap.createBitmap(smallBitmap.getWidth(), smallBitmap.getHeight(), Bitmap.Config.ARGB_8888);
               Canvas canvas = new Canvas(output);
               Paint paint = new Paint();

               RenderEffect blurEffect = RenderEffect.createBlurEffect(
                       (float) radius, (float) radius, Shader.TileMode.CLAMP);

               // Safe reflection: only runs on Android 12+
               Method setRenderEffect = Paint.class.getMethod("setRenderEffect", RenderEffect.class);
               setRenderEffect.invoke(paint, blurEffect);

               canvas.drawBitmap(smallBitmap, 0f, 0f, paint);
               return output;
           } catch (Throwable t) {
               t.printStackTrace();
               // Fallback if reflection fails
               return blurRenderScriptLegacy(context, smallBitmap, radius);
           }
       } else {
           return blurRenderScriptLegacy(context, smallBitmap, radius);
       }
    }

    @SuppressWarnings("deprecation")
    private Bitmap blurRenderScriptLegacy(Context context, Bitmap bitmap, double blurRadius) {
        Bitmap inputBitmap = bitmap.copy(Bitmap.Config.ARGB_8888, true);
        Bitmap outputBitmap = Bitmap.createBitmap(inputBitmap);

        RenderScript rs = null;
        try {
            rs = RenderScript.create(context);
            final Allocation input = Allocation.createFromBitmap(rs, inputBitmap);
            final Allocation output = Allocation.createTyped(rs, input.getType());
            final ScriptIntrinsicBlur script = ScriptIntrinsicBlur.create(rs, Element.U8_4(rs));
            script.setRadius((float) Math.min(blurRadius, 25.0));
            script.setInput(input);
            script.forEach(output);
            output.copyTo(outputBitmap);
        } catch (Exception e) {
            e.printStackTrace();
            return bitmap;
        } finally {
            if (rs != null) rs.destroy();
        }

        return outputBitmap;
    }

    /**
     * 
     * @param img
     * @return
     * @throws Exception
     * Method converts color format from 16 bit to 24 bit and returns. 
     * Its called by blurRenderScript method
     */

    private Bitmap RGB565toARGB888(Bitmap img) throws Exception {
        int numPixels = img.getWidth() * img.getHeight();
        int[] pixels = new int[numPixels];
    
        //Get JPEG pixels.  Each int is the color values for one pixel.
        img.getPixels(pixels, 0, img.getWidth(), 0, 0, img.getWidth(), img.getHeight());
    
        //Create a Bitmap of the appropriate format.
        Bitmap result = Bitmap.createBitmap(img.getWidth(), img.getHeight(), Bitmap.Config.ARGB_8888);
    
        //Set RGB pixels.
        result.setPixels(pixels, 0, result.getWidth(), 0, 0, result.getWidth(), result.getHeight());
        return result;
    }

    /**
     * 
     * @param blurRadius
     * @return
     * 
     * takeABlurredSnapshotWithWhite uses mostly android java apis. 
     * Except calls to find out current activity or context which are from react. 
     * They can be replaced with suitable android calls
     * View capture runs on the UI thread; blur and encoding run on the native modules queue.
     * It takes blurRadius as needed by Gaussian Blur algorithm. Valid values are 1-25. 
     * If 0 is passed in, image is not blurred.
     * It finds out what is the current activity of the current application thats running. 
     * Gets its root view and creates a bitmap i.e. screenshot of the visible window of the application
     * It then calls blurRenderScript method to blur the image in-memory.
     * Once blurred image is ready based on the blurRadius, its then compressed
     * Compressed image is converted to a base64 Image and resolves the caller's Promise.
     */
    private void takeABlurredSnapshotWithWhite(double blurRadius, Promise promise) {
      UiThreadUtil.runOnUiThread(() -> {
        try {
          Activity activity = getCurrentActivity();
          if (activity == null) {
            promise.reject("E_NO_ACTIVITY", "No current activity is available for capture.");
            return;
          }
          View rootView = activity.getWindow().getDecorView().getRootView();
          int width = rootView.getWidth();
          int height = rootView.getHeight();
          if (width <= 0 || height <= 0) {
            promise.reject("E_INVALID_VIEW_SIZE", "The current activity has no drawable area.");
            return;
          }
          Bitmap bitmapOrg = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888);
          rootView.draw(new Canvas(bitmapOrg));

          getReactApplicationContext().runOnNativeModulesQueueThread(() -> {
            try {
              promise.resolve(encodeBlurredSnapshot(bitmapOrg, blurRadius));
            } catch (Throwable e) {
              promise.reject("E_CAPTURE_FAILED", "Could not encode the activity capture.", e);
            }
          });
        } catch (Throwable e) {
          promise.reject("E_CAPTURE_FAILED", "Could not capture the current activity.", e);
        }
      });
    }

    private String encodeBlurredSnapshot(Bitmap bitmapOrg, double blurRadius) throws Exception {
      Bitmap bitmap = (blurRadius > 0)
              ? blurRenderScript(bitmapOrg, blurRadius)
              : bitmapOrg;
      try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
        if (!bitmap.compress(Bitmap.CompressFormat.JPEG, 100, outputStream)) {
          throw new IllegalStateException("JPEG compression failed.");
        }
        return Base64.getEncoder().encodeToString(outputStream.toByteArray());
      }
    }

  // Example method
  // See https://reactnative.dev/docs/native-modules-android
  @ReactMethod
  public void multiply(double a, double b, Promise promise) {
    promise.resolve(a * b);
  }
  @ReactMethod
  public void clickclick(double white, double alpha, Promise promise) {
    takeABlurredSnapshotWithWhite(alpha, promise);
  }
}
