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

#import "HclDiscover.h"
#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import <objc/runtime.h>
#import <CommonCrypto/CommonDigest.h>
#import "UIImageEffects.h"

@implementation HclDiscover
RCT_EXPORT_MODULE()

// Example method
// See // https://reactnative.dev/docs/native-modules-ios
RCT_EXPORT_METHOD(multiply:(double)a
                  b:(double)b
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)
{
    NSNumber *result = @(a * b);

    resolve(result);
}

+(UIImage*)scaleImage:(UIImage*)theImage toSize:(CGSize)theSize
{
    UIImage *scaledImage = nil;
    @try
    {
        UIGraphicsBeginImageContext(theSize);
        CGContextRef context = UIGraphicsGetCurrentContext();
        CGContextTranslateCTM(context, 0.0, theSize.height);
        CGContextScaleCTM(context, 1.0, -1.0);
        CGContextDrawImage(context, CGRectMake(0.0f, 0.0f, theSize.width, theSize.height), theImage.CGImage);
        scaledImage = UIGraphicsGetImageFromCurrentImageContext();
        UIGraphicsEndImageContext();
    }
    @catch (NSException *exception)
    {
        //DLog(@"Exception: %@", [exception reason]);
    }
    @finally
    {
    }
    return scaledImage;
}
+(NSData *)convertToData:(UIImage *)image
{
    if( !image ){
        return nil;
    }
    
    NSData *imageData = nil;
    @try{
        NSUInteger percentOfScreenshotsSize = 100;
        
        CGFloat width = [UIScreen mainScreen].bounds.size.width;
        CGFloat height = [UIScreen mainScreen].bounds.size.height;
        CGFloat normalizedWidth = width * percentOfScreenshotsSize * 0.01;
        CGFloat normalizedHeight = height * percentOfScreenshotsSize * 0.01;
        CGSize screenshotSize = CGSizeMake(normalizedWidth, normalizedHeight);

        imageData = UIImageJPEGRepresentation([self scaleImage:image toSize:screenshotSize], 0);        
    }
    @catch (NSException *exception) {
        //DLog(@"Exception: %@", [exception reason]);
    }
    @finally {
    }

    return imageData;
}
+(NSString*)md5HashFromNSData:(NSData*)imageViewImageData
{
    NSString *imageHash = nil;

    @try{
        if (imageViewImageData == nil) {
            return imageHash;
        }
        
        unsigned char result[CC_MD5_DIGEST_LENGTH];
        NSData *startPattern = [NSData dataWithBytes:(unsigned char[]){0xFF,0xDA} length:2];
        NSData *endPattern = [NSData dataWithBytes:(unsigned char[]){0xFF,0xD9} length:2];
        
        NSRange range;
        NSRange startImageLocation = [imageViewImageData rangeOfData:startPattern options:0 range:NSMakeRange(0,[imageViewImageData length])];
        NSRange endImageLocation = [imageViewImageData rangeOfData:endPattern options:NSDataSearchBackwards range:NSMakeRange(0,[imageViewImageData length])];
        startPattern = nil;
        endPattern = nil;
        if (startImageLocation.location==NSNotFound || endImageLocation.location==NSNotFound || (startImageLocation.location == 0 && startImageLocation.length == 0)) {
            int offset = 149;
            range.location = offset;
            range.length = [imageViewImageData length] - offset;
        } else {
            range.location = startImageLocation.location;
            range.length = endImageLocation.location + endImageLocation.length - startImageLocation.location;
        }
        
        if ((range.location + range.length)<= [imageViewImageData length]) {
            NSData* abridgedData = [imageViewImageData subdataWithRange:range];
            CC_MD5([abridgedData bytes], (int)[abridgedData length], result);
            imageHash = [NSString stringWithFormat:
                        @"%02X%02X%02X%02X%02X%02X%02X%02X%02X%02X%02X%02X%02X%02X%02X%02X",
                        result[0], result[1], result[2], result[3],
                        result[4], result[5], result[6], result[7],
                        result[8], result[9], result[10], result[11],
                        result[12], result[13], result[14], result[15]
                        ];
            abridgedData = nil;
        }
    }
    @catch (NSException *exception) {
        //DLog(@"Exception: %@", [exception reason]);
    }
    @finally {
    }

    return imageHash;
}
+(UIImage *)blurredImageWithImage:(UIImage *)sourceImage andBlurRadius:(double)blurRadius{

    //  Create our blurred image
    CIContext *context = [CIContext contextWithOptions:nil];
    CIImage *inputImage = [CIImage imageWithCGImage:sourceImage.CGImage];

    //  Setting up Gaussian Blur
    CIFilter *filter = [CIFilter filterWithName:@"CIGaussianBlur"];
    [filter setValue:inputImage forKey:kCIInputImageKey];
    [filter setValue:[NSNumber numberWithFloat:blurRadius] forKey:@"inputRadius"];
    CIImage *result = [filter valueForKey:kCIOutputImageKey];

    /*  CIGaussianBlur has a tendency to shrink the image a little, this ensures it matches 
     *  up exactly to the bounds of our original image */
    CGImageRef cgImage = [context createCGImage:result fromRect:[inputImage extent]];

    UIImage *retVal = [UIImage imageWithCGImage:cgImage];

    if (cgImage) {
        CGImageRelease(cgImage);
    }

    return retVal;
}
+(NSString*)takeABlurredSnapshotWithWhite:(double)white andAlpha:(double)alpha;
{
    NSString *imageHash = nil;

    @try{
        UIView* snapshotReadyView = [[UIApplication sharedApplication] keyWindow];
        UIGraphicsBeginImageContextWithOptions(snapshotReadyView.frame.size, snapshotReadyView.opaque, 0.0);
        [snapshotReadyView drawViewHierarchyInRect:snapshotReadyView.frame afterScreenUpdates:NO];
        UIImage *image = UIGraphicsGetImageFromCurrentImageContext();
        UIGraphicsEndImageContext();
        
        /*  Apply alpha to white and blur
            UIColor *tintColor = [UIColor colorWithBlue:white alpha:alpha];
            UIImage *blurredImage = [UIImageEffects imageByApplyingBlurToImage:image withRadius:1.5 tintColor:tintColor saturationDeltaFactor:1.2 maskImage:nil];
        */

        /* Gaussian blur */
        
        UIImage *blurredImage = nil;
        if(alpha > 0) {
            blurredImage = [self blurredImageWithImage:image andBlurRadius:alpha];
        }else{
            blurredImage = image;
        }

        NSData* imageData = [self convertToData:blurredImage];
        
        /*  Get MD5 for image data
            imageHash = [self md5HashFromNSData:imageData];
        */

        imageHash = [imageData base64EncodedStringWithOptions:0];
    }
    @catch (NSException *exception) {
        //DLog(@"Exception: %@", [exception reason]);
    }
    @finally {
    }

    return imageHash;
}

RCT_REMAP_METHOD(clickclick,
                 white:(double)white
                 alpha:(double)alpha
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)
{
    NSString* base64Data = [HclDiscover takeABlurredSnapshotWithWhite:white andAlpha:alpha];//@"I am base 64 data from iOS";
    resolve(base64Data);
}

@end
