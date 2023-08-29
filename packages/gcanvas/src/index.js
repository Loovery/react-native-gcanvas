import GCanvas from './env/canvas';
import GImage from './env/image';

import GWebGLRenderingContext from './context/webgl/RenderingContext';
import GContext2D from './context/2d/RenderingContext';

import GBridgeReactNative from './bridge/react-native';

export let Image = GImage;

export let WeexBridge = GBridgeWeex;
export let ReactNativeBridge = GBridgeReactNative;

export function enable(
  el,
  {
    bridge,
    debug,
    isAutoClearRectBeforePutImageData,
    isResetGlViewportAfterSetWidthOrHeight,
    devicePixelRatio,
    disableAutoSwap,
    disableComboCommands,
  } = {},
) {
  const GBridge = GImage.GBridge = GCanvas.GBridge = GWebGLRenderingContext.GBridge = GContext2D.GBridge = bridge;

  GBridge.callEnable(el.ref, [
    0, // renderMode: 0--RENDERMODE_WHEN_DIRTY, 1--RENDERMODE_CONTINUOUSLY
    -1, // hybridLayerType:  0--LAYER_TYPE_NONE 1--LAYER_TYPE_SOFTWARE 2--LAYER_TYPE_HARDWARE
    false, // supportScroll
    false, // newCanvasMode
    1, // compatible
    'white', // clearColor
    false, // sameLevel: newCanvasMode = true && true => GCanvasView and Webview is same level
  ]);

  if (debug === true) {
    GBridge.callEnableDebug();
  }
  if (disableComboCommands) {
    GBridge.callEnableDisableCombo();
  }

  const canvas = new GCanvas(el.ref, {
    isAutoClearRectBeforePutImageData,
    isResetGlViewportAfterSetWidthOrHeight,
    devicePixelRatio,
    disableAutoSwap,
    style: el.style,
  });

  return canvas;
}

export function disable(canvas) {
  canvas.disabled = true;
  if (canvas.webglInterval) {
    clearInterval(canvas.webglInterval);
  }

  const ref = canvas.id;
  GCanvas.GBridge.callDisable(ref);
}
