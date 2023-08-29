import React, {useRef, useEffect} from 'react'

import {
  NativeModules,
  Platform,
  findNodeHandle,
} from 'react-native'
import '@flyskywhy/react-native-browser-polyfill'
import CanvasView from './CanvasView'
import {enable, disable, ReactNativeBridge} from '../packages/gcanvas'

ReactNativeBridge.GCanvasModule = NativeModules.GCanvasModule
ReactNativeBridge.Platform = Platform

const defaultProps = {
  isAutoClearRectBeforePutImageData: false,
  isResetGlViewportAfterSetWidthOrHeight: true,
  devicePixelRatio: undefined,
  offscreenCanvas: false,
  disableAutoSwap: false,
}

const GCanvasView = (props) => {
  const {onCanvasResize, onCanvasCreate, onIsReady} = props

  const {
    isAutoClearRectBeforePutImageData,
    isResetGlViewportAfterSetWidthOrHeight,
    devicePixelRatio,
    offscreenCanvas,
    disableAutoSwap,
  } = {...defaultProps, ...props}

  const canvasViewRef = useRef(null)
  const canvasRef = useRef(null)

  const _onIsReady = (event) => {
    onIsReady && onIsReady(Platform.OS === 'ios' ? true : event.nativeEvent.value)
  }

  const onLayout = (event) => {
    const width = event.nativeEvent.layout.width | 0
    const height = event.nativeEvent.layout.height | 0
    let ref = '' + findNodeHandle(canvasViewRef.current)

    if (canvasRef.current !== null) {
      if (canvasRef.current.clientWidth !== width || canvasRef.current.clientHeight !== height) {
        canvasRef.current.clientWidth = width
        canvasRef.current.clientHeight = height
        if (onCanvasResize) {
          onCanvasResize({width, height, canvas: canvasRef.current})
        }
      }
      return
    }

    if (canvasViewRef.current === null) {
      onLayout(event)
      return
    }

    canvasRef.current = enable(
      {
        ref,
        style: {
          width,
          height,
        },
      },
      {
        isAutoClearRectBeforePutImageData: props.isAutoClearRectBeforePutImageData,
        isResetGlViewportAfterSetWidthOrHeight: props.isResetGlViewportAfterSetWidthOrHeight,
        devicePixelRatio: props.devicePixelRatio,
        disableAutoSwap: props.disableAutoSwap,
        bridge: ReactNativeBridge,
      },
    )

    if (props.offscreenCanvas && !global.createCanvasElements.includes(canvasRef.current)) {
      global.createCanvasElements.push(canvasRef.current)
    }

    if (onCanvasCreate) {
      onCanvasCreate(canvasRef.current)
    }
  }

  useEffect(() => {
    return () => {
      if (canvasRef.current) {
        disable(canvasRef.current)
      }

      let index = global.createCanvasElements.findIndex(canvas => canvas === canvasRef.current)

      if (index >= 0) {
        global.createCanvasElements.splice(index, 1)
      }
    }
  }, [])

  return (
    <CanvasView
      {...props}
      ref={canvasViewRef}
      onLayout={onLayout}
      onChange={_onIsReady}
    />
  )
}

export default GCanvasView
