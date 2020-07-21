<template>
    <div>
        <h3 class="text-center">视频采集</h3>
        <div v-show="!Recording">
            
            <button @click="beginRecording">开始录制</button>
        </div>
        <div v-show="Recording" class="d-flex flex-column ai-center" >
            <video ref="video" controls autoplay style="width:100%"></video>
            <button @click="endRecording">取消录制</button>
        </div>
    </div>
</template>

<script>
    import MediaStreamRecorder from 'msr'
    export default {
        data () {
            return {
               Recording:false,
                blobUrl:"",
                mediaRecorder:null
            }
        },
        methods:{
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
            // 开始录音
            beginRecording(){
                // 获取音频流媒体
                navigator.mediaDevices.getUserMedia({audio: true,video: true}).then(stream => {
                    this.mediaRecorder = new MediaStreamRecorder(stream)
                    this.mediaRecorder.stream = stream
                    this.Recording = true
                    this.$refs.video.srcObject = stream
                    // cons
                    this.mediaRecorder.mimeType = 'video/webm';
                    this.mediaRecorder.ondataavailable = (blob) => {
                    // POST/PUT "Blob" using FormData/XHR2
                        this.sendBolb('POST','/stream',blob).then(()=>{
                          console.log("send success")
                        })
                        let blobURL = URL.createObjectURL(blob);
                        this.blobUrl = blobURL
                        this.Recording = true
                    }
                    this.mediaRecorder.start(3000)
                })
            },
            // 结束录音
            endRecording(){
                this.mediaRecorder.stop()
                this.Recording = false
            }
        }
    }
</script>

<style lang="scss" scoped>

</style>