!function (exports) {
    var Constant = {
        MsgSuccess: 'success',
        MsgFail: 'fail',
        MsgOk: 'ok',
        MsgCancel: 'cancel',
        Results: 'results',
        Camera: {
            Direction: {
                Back: 0,
                Front: 1
            },
            DestinationType: {
                DATA_URL: 0,
                FILE_URI: 1
            },
            EncodingType: {
                JPEG: 0,
                PNG: 1
            }
        }
    }


    var ua = navigator.userAgent.toLowerCase()
    var postMessageEnabled = false
    if (ua.indexOf('postmessageenabled') != -1) {
        postMessageEnabled = true
    }

    function noop() {
    }

    var callbackIndex = 1

    var callBackFns = []

    exports['__YutaAppCallback'] = function (cdId, args) {
        if (typeof args == 'string') {
            args = JSON.parse(args)
        }
        callBackFns[cdId](args)
        delete callBackFns[cdId]
    }


    function invokeWrap(methodName, args, fn) {
        args = args || {}
        fn = fn || noop
        if ('callbackId' in args) {
            throw new Error('`callbackId` in args!! should not do this')
        }
        var id = callbackIndex.toString()
        args['callbackId'] = id
        callBackFns[id] = fn
        callbackIndex++
        if (postMessageEnabled) {
            var newObj = {methodName: methodName, args: args}
            window.webkit.messageHandlers.__YutaJsBridge.postMessage(JSON.stringify(newObj))
        } else {
            __YutaJsBridge.invoke(methodName, JSON.stringify(args))
        }
    }

    function defaultFailFunc(e) {
        console.warn(e)
    }

    /**
     * @param options:
     * onSuccess:function required
     * onFail:function,
     * args:{}
     */
    function wrapSuccessFailFunc(options) {
        var methodName = options.methodName,
            args = options.args
        if (!methodName) {
            throw new Error('methodName is required')
        }
        if (typeof options.onSuccess !== 'function') {
            throw new Error('onSuccess is required')
        }
        options.onFail = options.onFail || defaultFailFunc()

        invokeWrap(options.methodName, args, function (args) {
            var msg = args['message']
            if (msg == Constant.MsgSuccess) {
                options.onSuccess(args[Constant.Results])
            } else if (msg == Constant.MsgFail) {
                options.onFail(args[Constant.Results])
            } else {
                console.warn('unknown message type ')
            }
        })
    }

    function wrapOkCancelFunc(options) {
        var methodName = options.methodName,
            args = options.args
        if (!methodName) {
            throw new Error('methodName is required')
        }
        if (typeof options.onOk !== 'function') {
            throw new Error('onOk is required')
        }
        options.onCancel = options.onCancel || defaultFailFunc()

        invokeWrap(options.methodName, args, function (args) {
            var msg = args['message']
            if (msg == Constant.MsgOk) {
                options.onOk()
            } else if (msg == Constant.MsgCancel) {
                options.onCancel()
            } else {
                //TODO emit event
                console.warn('unknown message type ')
            }
        })
    }


    /**
     * Yuta Object
     */
    var Yuta = {}

    Yuta.Constant = Constant
    Yuta.Camera = {
        getPicture: function (onSuccess, onFail, options) {
            wrapSuccessFailFunc({
                methodName: 'Yuta.Camera.getPicture',
                onSuccess: onSuccess,
                onFail: onFail,
                args: options
            })
        }
    }

    Yuta.WebView = {
        close: function (url) {
            invokeWrap('Yuta.WebView.close', {url: url})
        },
        closeAll: function (url) {
            invokeWrap('Yuta.WebView.closeAll', {url: url})
        },
        load: function (url) {
            invokeWrap('Yuta.WebView.load', {url: url})
        },
        open: function (url) {
            invokeWrap('Yuta.WebView.open', {url: url})
        }
    }


    Yuta.Share = {
        image: function (image, url, title, content, callback) {
            invokeWrap('Yuta.Share.image', {
                image: image,
                url: url,
                title: title,
                content: content
            }, callback)
        },
        video: function (url, thumb, title, callback) {
            invokeWrap('Yuta.Share.video', {
                url: url,
                thumb: thumb,
                title: title
            }, callback)
        },
        music: function (url, thumb, title, author, callback) {
            invokeWrap('Yuta.Share.music', {
                url: url,
                thumb: thumb,
                title: title,
                author: author
            }, callback)
        }
    }


    Yuta.Device = {
        getProperties: function (callback) {
            invokeWrap('Yuta.Device.getProperties', {}, callback)
        }
    }

    Yuta.Connection = {
        getType: function (callback) {
            invokeWrap('Yuta.Connection.getType', {}, callback)
        }
    }

    Yuta.Dialogs = {
        alert: function (message, okCallBack, title, okButtonName) {
            var args = {message: message}
            if (title) args.title = title
            if (okButtonName) args.okButtonName = okButtonName
            invokeWrap('Yuta.Dialogs.alert', args, okCallBack)
        },
        //{message:'ok'|'cancel'}
        confirm: function (message, okCallback, title, okButtonName, cancelButtonName, cancelCallback) {
            var args = {message: message}
            if (title) args.title = title
            if (okButtonName) args.okButtonName = okButtonName
            if (cancelButtonName) args.cancelButtonName = cancelButtonName
            wrapOkCancelFunc(okCallback, cancelCallback, {
                methodName: 'Yuta.Dialogs.confirm',
                onOk: okCallback,
                onCancel: cancelCallback,
                args: args
            })
        },
        prompt: function (message, okCallback, defaultValue, title, okButtonName, cancelButtonName, cancelCallback) {
            var args = {message: message}
            if (defaultValue) args.defaultValue = defaultValue
            if (title) args.title = title
            if (okButtonName) args.okButtonName = okButtonName
            if (cancelButtonName) args.cancelButtonName = cancelButtonName
            wrapOkCancelFunc(okCallback, cancelCallback, {
                methodName: 'Yuta.Dialogs.prompt',
                onOk: okCallback,
                onCancel: cancelCallback,
                args: args
            })
        },
        toast: function (message, duration) {
            var args = {message: message, duration: duration || 1200}
            invokeWrap('Yuta.Dialogs.toast', args)
        }
    }

    exports.Yuta = Yuta

}(window)
