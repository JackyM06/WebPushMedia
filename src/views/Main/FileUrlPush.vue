<template>
    <div class="d-flex flex-column jc-center ai-center">        
        <div class="d-flex flex-column jc-center ai-center mt-3">
          <h3>公网文件URL推流</h3>
          <p class="fs-xxs text-center mb-1">请输入推流的RTMP地址</p>
          <input class="mb-1 p-1" v-model="pushUrl" type="text" style="width:300px" placeholder="请输入推流的RTMP地址">
          <p class="fs-xxs mb-1 text-center">请输入文件在公网的URL地址</p>
          <textarea ref="FileUrl" v-model="FileUrl" style="width:300px" class="fs-xxs mb-2" placeholder="请输入文件在公网的URL地址" rows="5" cols="20"></textarea>
          <button v-show="!Uploading" @click="beginUpload">开始文件推流</button>
          <button v-show="Uploading" @click="endUploading">取消文件推流</button>
          <p class="fs-xxs my-2 text-center" v-text="message"></p>
        </div>
    </div>
</template>

<script>
    import io from 'socket.io-client'
    // import MediaStreamRecorder from 'msr'
    export default {
        props:{
          connectURL:{
            type:String,
            default:'http://localhost:8090'
          }
        },
        data () {
            return {
                pushUrl:null,
                socket:null,
                message:'点击开始文件推流进行RTMP推流',
                Uploading:false,
                canSend:false,
                FileUrl:""
            }
        },
        methods:{
            // ? websocket 方案 //
            // 获取连接 
            socketConnect(wsUrl){
              this.socket = io.connect(wsUrl,{ 'reconnect': false, 'auto connect': false, })
              this.socket.on('connected',()=>{
                this.message = "webscocket连接成功，正在提交推流地址"
                this.canSend = true
                if(this.FileUrl){
                  this.Uploading = true
                  this.socketFileSend(this.FileUrl,this.pushUrl)
                }
              })
              this.socket.on('startError',msg =>{
                this.message = "操作异常请重试，错误信息:"+msg
                this.Uploading = false
                this.canSend = false
              })
              this.socket.on('ended',()=>{
                this.message = '推流已结束'
                this.Uploading = false
                this.canSend = false
              })
            },
            // 断开连接
            socketDisconnect(){
              if(this.socket){
                this.socket.emit('end')
              }
            },
            socketFileSend(FileUrl,pushUrl){
              if(this.canSend){
                this.socket.emit("sendFileUrl", FileUrl,pushUrl)
              }else{
                this.message = '当前连接存在波动，正在重试'
              }
              this.socket.on('sent',()=>{
                this.message = "正在推流，可到采集结果中拉流查看效果"
              })
            },

            beginUpload(){
              this.socketConnect(this.connectURL)
            },
            endUploading(){
              this.socketDisconnect()
              this.Uploading = false
              this.canSend = false
              this.socket = null
              
            },
           initPushURL(){
              if(localStorage.getItem('rtmp') == undefined || !localStorage.getItem('rtmp').includes('rtmp://')){
                let mockUrl = `rtmp://${window.location.hostname}:1935/live/root_`+parseInt(Math.random()*100000)
                this.pushUrl = mockUrl
              }else{
                this.pushUrl = localStorage.getItem('rtmp')
              }
            },
            setPushURL(val){
              if(val.includes && val.includes('rtmp://')){
                localStorage.setItem('rtmp',val)
              }
            }
        },
        mounted(){
          this.initPushURL()
        },
        watch:{
          message(val){
            console.log(val)
          },
          pushUrl(val){
            this.setPushURL(val)
          }
        },
        beforeDestroy(){
          this.endUploading()
        }
    }
</script>

<style lang="scss" scoped>

</style>