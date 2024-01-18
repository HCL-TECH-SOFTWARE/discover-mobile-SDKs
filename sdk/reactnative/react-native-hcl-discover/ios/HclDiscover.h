
#ifdef RCT_NEW_ARCH_ENABLED
#import "RNHclDiscoverSpec.h"

@interface HclDiscover : NSObject <NativeHclDiscoverSpec>
#else
#import <React/RCTBridgeModule.h>

@interface HclDiscover : NSObject <RCTBridgeModule>
#endif

@end
