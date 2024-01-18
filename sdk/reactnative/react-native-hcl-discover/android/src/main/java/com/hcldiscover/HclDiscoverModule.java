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
import com.facebook.react.module.annotations.ReactModule;


import java.io.ByteArrayOutputStream;
import java.util.Base64;

import android.graphics.Bitmap;
import android.view.View;
import android.renderscript.Allocation;
import android.renderscript.Element;
import android.renderscript.RenderScript;
import android.renderscript.ScriptIntrinsicBlur;
import android.content.Context;

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

    Context context = getCurrentActivity().getApplicationContext();

    try {
            smallBitmap = RGB565toARGB888(smallBitmap);
        } catch (Exception e) {
            e.printStackTrace();
        }
    
        Bitmap bitmap = Bitmap.createBitmap(
                smallBitmap.getWidth(), smallBitmap.getHeight(),
                Bitmap.Config.ARGB_8888);
    
        RenderScript renderScript = RenderScript.create(context);
    
        Allocation blurInput = Allocation.createFromBitmap(renderScript, smallBitmap);
        Allocation blurOutput = Allocation.createFromBitmap(renderScript, bitmap);
    
        ScriptIntrinsicBlur blur = ScriptIntrinsicBlur.create(renderScript,
                Element.U8_4(renderScript));
        blur.setInput(blurInput);
        blur.setRadius((float)radius); // radius must be 0 < r <= 25
        blur.forEach(blurOutput);
    
        blurOutput.copyTo(bitmap);
        renderScript.destroy();
    
        return bitmap;
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
     * takeABlurredSnapshotWithWhite is synchronous method. 
     * It takes blurRadius as needed by Gaussian Blur algorithm. Valid values are 1-25. 
     * If 0 is passed in, image is not blurred.
     * It finds out what is the current activity of the current application thats running. 
     * Gets its root view and creates a bitmap i.e. screenshot of the visible window of the application
     * It then calls blurRenderScript method to blur the image in-memory.
     * Once blurred image is ready based on the blurRadius, its then compressed
     * Compressed image is converted to a base64 Image. This string is returned to the caller.
     */
    private String takeABlurredSnapshotWithWhite( double blurRadius ) {
      String encodedImageString = "no image yet";
      try {
        // get root view of the activity
        View v1 = getCurrentActivity().getWindow().getDecorView().getRootView();
        v1.setDrawingCacheEnabled(true);
        Bitmap bitmapOrg = Bitmap.createBitmap(v1.getDrawingCache());
        v1.setDrawingCacheEnabled(false);

        Bitmap bitmap = null;
        
        if(blurRadius > 0){
            bitmap = blurRenderScript( bitmapOrg, blurRadius );
        }else{
            bitmap = bitmapOrg;
        }

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        int quality = 100;
        bitmap.compress(Bitmap.CompressFormat.JPEG, quality, outputStream);
        
        encodedImageString = Base64.getEncoder().encodeToString(outputStream.toByteArray());

        outputStream.close();

      } catch (Throwable e) {

        e.printStackTrace();

        encodedImageString = e.toString();
      }

    return encodedImageString;
}

  // Example method
  // See https://reactnative.dev/docs/native-modules-android
  @ReactMethod
  public void multiply(double a, double b, Promise promise) {
    promise.resolve(a * b);
  }
  @ReactMethod
  public void clickclick(double white, double alpha, Promise promise) {
    promise.resolve(takeABlurredSnapshotWithWhite( alpha ));
  }
}
