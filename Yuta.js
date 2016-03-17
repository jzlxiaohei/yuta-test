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
    function generateSuccessFailFunc(options){
        if(typeof options.onSuccess !== 'function'){
            throw new Error('onSuccess must be provided')
        }
        options.onFail = options.onFail || defaultFailFunc()
        return function (){
            invokeWrap('Yuta.Camera.getPicture',options,function(args){
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
    }


    var Constant={
        MsgSuccess :'success',
        MsgFail:'fail',
        Results:'results',
        Camera:{
            Direction:{
                Back:1
            }
        }
    }

    /**
     * Yuta Object
     */
    var Yuta = {}



    Yuta.Camera={
        getPicture:function(onSuccess,onFail,options){
            invokeWrap('Yuta.Camera.getPicture',options,function(args){
                var msg = args['message']
                if(msg == Constant.MsgSuccess){
                    onSuccess(args[Constant.Results])
                }else if(msg == Constant.MsgFail){
                    onFail(args[Constant.Results])
                }else{
                    console.warn('unknown message type ')
                }
            })
        }
    }

}(window)