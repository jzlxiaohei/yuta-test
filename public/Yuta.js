!function(exports){
    var callbackIndex = 1

    var callBackFns = []

    exports['__YutaAppCallback'] = function(cdId,args){
        callBackFns[cdId](args)
    }

    function invokeWrap(methodName,args,fn){
        if('callbackId' in args){
            throw new Error(' `callbackId` in args!! should not do this')
        }
        var id = callbackIndex.toString();
        args['callbackId'] = id
        callBackFns[id] = fn
        callbackIndex++;
        __YutaJsBridge.invoke(methodName,args)
    }

    function defaultFailFunc(e){
        console.warn(e)
    }

    /**
     * @param options:
     * onSuccess:function required
     * onFail:function,
     * args:{}
     */
    function wrapSuccessFailFunc(options){
        var methodName = options.methodName,
            args = options.args
        if(!methodName){
            throw new Error('methodName is required')
        }
        if(typeof options.onSuccess !== 'function'){
            throw new Error('onSuccess is required')
        }
        options.onFail = options.onFail || defaultFailFunc()

        invokeWrap(options.methodName,args,function(args){
            var msg = args['message']
            if(msg == Constant.MsgSuccess){
                options.onSuccess(args[Constant.Results])
            }else if(msg == Constant.MsgFail){
                options.onFail(args[Constant.Results])
            }else{
                console.warn('unknown message type ')
            }
        })

    }


    var Constant={
        MsgSuccess :'success',
        MsgFail:'fail',
        Results:'results',
        Camera:{
            Direction:{
                Back:0,
                Front:1
            },
            DestinationType:{
                DATA_URL:0,
                FILE_URI:1
            },
            EncodingType:{
                JPEG:0,
                PNG:1
            }
        }
    }

    /**
     * Yuta Object
     */
    var Yuta = {}

    Yuta.Constant = Constant
    Yuta.Camera={
        getPicture:function(onSuccess,onFail,options){
            wrapSuccessFailFunc({
                methodName:'Yuta.Camera.getPicture',
                onSuccess:onSuccess,onFail:onFail,
                args:options})
        }
    }

    exports.Yuta = Yuta
}(window)