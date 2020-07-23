<template>
    <div class="d-flex flex-column jc-center ai-center">        
        <div class="d-flex flex-column jc-center ai-center mt-3">
          <h3>文件推流 (试验阶段)</h3>
           <input class="mb-2 p-1" v-model="pushUrl" type="text" style="width:300px" placeholder="请输入推流的RTMP地址">
          <input ref="file" type="file" accept="audio/*" class="fs-xxs my-2 text-center">
          <button v-show="!Uploading" @click="beginUpload">开始文件推流</button>
          <div v-show="Uploading" class="d-flex flex-column jc-center ai-center mt-3">
            <audio ref="audio" autoplay  controls="controls" muted="muted"></audio>
            <button  @click="endUploading">取消文件推流</button>
          </div>
          <p class="fs-xxs my-2 text-center" v-text="message"></p>
        </div>
    </div>
</template>

<script>
    import io from 'socket.io-client'
    // import MediaStreamRecorder from 'msr'
    export default {
        data () {
            return {
                Recording:false,
                blobUrl:"",
                mediaRecorder:null,
                pushUrl:'rtmp://39.106.198.9:1935/live/home',
                socket:null,
                message:'点击开始文件推流进行RTMP推流',
                canSend:false,
                Uploading:false
            }
        },
        computed:{
          connectURL(){
            return 'http://localhost:8090'
          }
        },
        methods:{
            // ? websocket 方案 //
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
            // 断开连接
            socketDisconnect(){
              if(this.socket){
                this.socket.emit('end')
                this.socket.on('ended',()=>{
                  this.message = '推流已结束'
                })
              }
            },
            socketFileSend(blob){
              if(this.canSend){
                this.socket.emit("sendFileBlob", blob)
              }else{
                this.message = '当前连接存在波动，正在重试'
              }
              this.socket.on('sent',()=>{
                this.message = "正在推流，可到采集结果中拉流查看效果"
              })
            },
            // beginUpload(){
            //   let file = this.$refs.file.files[0]
            //   if(file){
            //       console.log(new MediaStream().addTrack(file))
            //       this.Uploading = true
            //       this.$refs.audio.src = URL.createObjectURL(file)
            //       console.log(this.$refs.audio.src)
            //       console.log(this.$refs.audio.s)
            //   }else{
            //     alert("请选择音频文件")
            //   }
            // },
            beginUpload(){
              let file = this.$refs.file.files[0]
              if(file){
                this.fileSlice(file)
                let type = file.type
                this.socketConnect(this.connectURL)
                let reader = new FileReader()
                reader.readAsArrayBuffer(file)
                reader.onload = (e)=>{
                  let blob = null
                  if (typeof e.target.result === 'object') {
                    blob = new Blob([e.target.result],{type})
                  } else {
                    blob = e.target.result
                  }
                  this.Uploading = true
                  setTimeout(()=>{
                    this.socketFileSend(blob)
                  },3000)
                  console.log('blob: ', blob);
                }
              }else{
                alert("请选择音频文件")
              }
            },
            endUploading(){
              this.socketDisconnect()
              Object.assign(this.$data, this.$options.data())
            },
            fileSlice(file){
              console.log(file)
            }
        },
        beforeDestroy(){
          this.endUploading()
        }
    }
</script>

<style lang="scss" scoped>

</style>