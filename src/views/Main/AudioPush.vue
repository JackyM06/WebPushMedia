<template>
    <div class="d-flex flex-column jc-center ai-center">
        <h3 class="text-center">音频采集</h3>
        <div v-show="!Recording" class="d-flex flex-column ai-center">
            <input class="mb-2 p-1" v-model="pushUrl" type="text" style="width:300px" placeholder="请输入推流的RTMP地址">
            <button @click="beginRecording">开始录音推流</button>
        </div>
        <div v-show="Recording" class="d-flex flex-column jc-center ai-center">
            <h4>本地预览</h4>
            <audio ref="audio" autoplay  controls="controls" muted="muted"></audio>
            <button @click="endRecording">取消录音推流</button>
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
                pushUrl:'rtmp://39.106.198.9:1935/live/home',
                socket:null,
                message:'点击开始录音进行RTMP推流',
                canSend:false,
            }
        },
        methods:{
            // HTTP 方案
            sendBolb(type,url,blob){
              const BaseURL = "http://localhost:3000"
              url = BaseURL + url
              return new Promise((res,rej)=>{
                let data = new FormData()
                data.append('media',blob)
                let request = new XMLHttpRequest()
                request.open(type,url)
                request.send(data)
                request.onreadystatechange = ()=>{
                  if(request.readyState === 4){
                    if(request.status === 200){
                      res('ok')
                    }else{
                      rej(new Error("connect was error"))
                    }
                  }
                }
              }) 
            },
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
                this.message = "正在推流，可到采集结果中拉流查看效果"
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
            //  方案3 采用RTCPeerConnection 方案 (已废弃)
            RtcpeerConnect(stream){
              const pc = new RTCPeerConnection({
                sdpSemantics: 'unified-plan',
              })
              stream.getTracks().forEach((track) =>
                pc.addTransceiver(track, {
                  direction: 'sendrecv',
                  streams: [stream],
                })
              )
              pc.addEventListener('track', (e) => {
                this.$refs.audio.srcObject = e.streams[0]
              })
              pc.createOffer()
              .then((offer) => pc.setLocalDescription(offer)) //设置本地描述
              .then(() =>{
                fetch('http://localhost:3000/connect', {
                  method: 'POST',
                  headers: { 'Content-Type': 'text/plain' },
                  body: pc.localDescription.sdp,
                })
              .then((res) => {
                if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
                return res.json();
              })  
              .then((answer) => pc.setRemoteDescription(answer))
              .catch((err) => console.error(err));
              })
            },

            beginRecording(){
                // 获取音频流媒体
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
                })
            },
            // 结束录音
            endRecording(){
                this.socketDisconnect()
                if(this.mediaRecorder)this.mediaRecorder.stop()
                Object.assign(this.$data, this.$options.data())
            },
        },
        watch:{
          message(val){
            console.log(val)
          }
        },
        beforeDestroy(){
          this.endRecording()
        }
    }
</script>

<style lang="scss" scoped>
 
</style>