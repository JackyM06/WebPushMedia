<template>
    <div>
        <h3 class="text-center">音频采集</h3>
        <div v-show="!Recording" class="d-flex flex-column ai-center">
            <input class="mb-2 p-1" v-model="pushUrl" type="text" style="width:300px" placeholder="请输入推流的RTMP地址">
            <button @click="beginRecording">开始录音</button>
        </div>
        <div v-show="Recording" class="d-flex flex-column jc-center ai-center">
            <h4>本地预览</h4>
            <audio ref="audio" autoplay  controls="controls"></audio>
            <button @click="endRecording">取消录音</button>
        </div>
    </div>
</template>

<script>
    import MediaStreamRecorder from 'msr'
    // import { createWorker }  from 'ffmpeg.js'
    import io from 'socket.io-client'
    export default {
        data () {
            return {
                Recording:false,
                blobUrl:"",
                mediaRecorder:null,
                pushUrl:'rtmp://localhost:1935/live/home',
                socket:null,
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
            // websocket 方案
            async socketConnect(wsUrl){
              this.socket = io.connect(wsUrl)
              setTimeout(()=>{
                this.socket.emit('start',this.pushUrl)
                console.log(this.socket.connected)
              },100)
               
            },
            socketSend(blob){
              if(this.socket.connected){
                this.socket.emit("sendBlob", blob)
                this.Recording = true
              }else{
                this.endRecording()
                alert('建立websocket连接失败请检查是否正确开始Node推流服务')
              }
              
            },
            socketDisconnect(){
              this.socket.emit('end')
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
                    // this.RtcpeerConnect(stream)
                    // this.sendStream(stream) 
                    this.socketConnect('http://localhost:3000')
                    
                    this.mediaRecorder = new MediaStreamRecorder(stream)
                    this.mediaRecorder.mimeType = 'audio/wav';
                    this.mediaRecorder.ondataavailable = (blob) => {
                    // POST/PUT "Blob" using FormData/XHR2  
                        let blobURL = URL.createObjectURL(blob);
                        this.blobUrl = blobURL
                        this.socketSend(blob)                                     
                        
                    }
                    this.mediaRecorder.start(1000)
                })
            },
            // 结束录音
            endRecording(){
                this.socketDisconnect()
                this.mediaRecorder.stop()
                this.Recording = false
                this.$refs.audio.srcObject = null
            }
        }
    }
</script>

<style lang="scss" scoped>

</style>