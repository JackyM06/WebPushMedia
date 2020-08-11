<template>
    <div class="d-flex flex-column jc-center ai-center">
        <h3 class="text-center">音频采集</h3>
        <div v-show="!Recording" class="d-flex flex-column ai-center">
            <input class="mb-2 p-1" v-model="pushUrl" type="text" style="width:300px" placeholder="请输入推流的RTMP地址">
            <button @click.stop="beginRecording">开始录音推流</button>
        </div>
        <div v-show="Recording" class="d-flex flex-column jc-center ai-center">
            <h4>本地预览</h4>
            <audio ref="audio" autoplay  controls="controls" muted="muted"></audio>
            <button @click.stop="endRecording">取消录音推流</button>
        </div>
        <p class="fs-xxs my-2 text-center" v-text="message"></p>
        <!-- <textarea ref="msg" name="msg" id="" style="width:300px" cols="30" rows="10"></textarea> -->
    </div>
</template>

<script>
    import MediaStreamRecorder from 'msr'
    // import { createWorker }  from 'ffmpeg.js'
    import io from 'socket.io-client'
    export default {
        props:{
          connectURL:{
            type:String,
            default:'http://localhost:8090'
          }
        },
        data () {
            return {
                Recording:false,
                blobUrl:"",
                mediaRecorder:null,
                pushUrl:null,
                socket:null,
                message:'点击开始录音进行RTMP推流',
                canSend:false,
            }
        },
        methods:{
            // ? websocket 方案 
            // 获取连接 
            socketConnect(wsUrl){
              this.socket = io.connect(wsUrl)
              this.socket.on('connected',()=>{
                this.socket.emit('start',this.pushUrl)
                this.message = "webscocket连接成功，正在提交推流地址"
              })
              this.socket.on('started',()=>{
                this.message = "推流地址提交成功，即将开始推流"
                this.canSend = true
              })
              this.socket.on('startError',msg =>{
                this.message = "操作异常请重试，错误信息:"+msg
                this.endRecording()
              })
            },
            // 发送blob对象
            socketSend(blob){
              if(this.canSend){
                this.socket.emit("sendBlob", blob)
              }else{
                this.message = '当前连接存在波动，正在重试'
              }
              this.socket.on('sent',()=>{
                this.message = "正在推流直播中，现在可到“采集结果”中拉流查看效果"
              })
            },
            // 断开连接
            socketDisconnect(){
              if(this.socket){
                this.socket.emit('end')
                this.socket.on('ended',()=>{
                  this.message = '推流已结束'
                })
              }
            },
          

            beginRecording(){
                // 获取音频流媒体
                if(!navigator.mediaDevices) return this.throwError()
                navigator.mediaDevices.getUserMedia({audio:true}).then(stream => {
                    this.$refs.audio.srcObject = stream
                    this.$refs.audio.volume = 0
                    // this.socketConnect('http://39.106.198.9:8090')
                    this.socketConnect(this.connectURL)
                    this.Recording = true
                    // 创建MediaStreamRecorder对象
                    this.mediaRecorder = new MediaStreamRecorder(stream)
                    this.mediaRecorder.mimeType = 'audio/wav';
                    this.mediaRecorder.ondataavailable = (blob) => {
                        this.socketSend(blob)                                     
                    }
                    this.mediaRecorder.start(1000)
                }).catch(()=>{
                  this.throwError()
                })
            },
            // 结束录音
            endRecording(){
                if(this.mediaRecorder)this.mediaRecorder.stop()
                this.socketDisconnect()
                Object.assign(this.$data, this.$options.data())
                this.initPushURL()
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
            },
            throwError(){
              this.$parent.mediaError()
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
          this.endRecording()
        },
    }
</script>

<style lang="scss" scoped>
 
</style>