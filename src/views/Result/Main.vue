<template>
<div class="box">
  <div v-if="isAudio" class="text-center">
    <h1 class="mb-4">RTMP（HTTP-FLV）音频拉流</h1>
    <audio id="MediaElement" autoplay  class="my-2" controls="controls"></audio>
  </div>
  <div v-else class="text-center mb-2">
    <h1 class="mb-4" >RTMP（HTTP-FLV）视频拉流</h1>
    <video style="max-width:90vw;width: 700px;" id="MediaElement"  autoplay  controls="controls"></video>
  </div>
  <input type="text" class="inputStyle" v-model="urlCache" placeholder="请输入拉流地址，支持FLV">
  <p class="fs-xxs mb-2">仅支持flv格式,为便于调试默认为自动拼接的拉流地址，实际地址请以自身情况为准。</p>
  <p class="fs-xxs mb-2" ref="pullState" v-text="pullState"></p>
  <button @click="flvInit">开始</button>
  <button @click="changeMode" v-text="switchMode" class="mt-2"></button>

</div>
</template>

<script>
  import flvjs from 'flv.js'
  export default {
    data () {
      return {
        urlCache:null,
        pullUrl:null,
        flvPlayer:null,
        pullState:"点击开始进行拉流",
        isAudio:true,
        switchMode:"切换为视频拉流"
      }
    },
    methods:{
      // 初始化flvPlayer
      flvInit(){
        this.flvDestory()
        this.pullUrl = this.urlCache
        if (flvjs.isSupported()) {
          var MediaElement = document.getElementById('MediaElement');
          this.flvPlayer = flvjs.createPlayer({
              type: 'flv',
              url:this.pullUrl, //本地
          })
          this.pullState = "当前拉流地址："+ this.pullUrl
          this.flvPlayer.attachMediaElement(MediaElement)
          this.flvPlayer.load()
          this.flvPlayer.play()
          MediaElement.addEventListener('ended',()=>{
            this.flvInit()
          })
        }
      },
      // 销毁flvPlayer
      flvDestory(){
        if(this.flvPlayer){
          this.flvPlayer.pause()
          this.flvPlayer.unload()
          this.flvPlayer.detachMediaElement()
          this.flvPlayer.destroy()
          this.flvPlayer = null
        }
      },
      changeMode(){
        if(this.isAudio == true){
          this.isAudio = false
          this.switchMode = "切换为音频拉流"
        }else{
          this.isAudio = true
          this.switchMode = "切换为视频拉流"
        }
        this.flvInit()
      },
      initPullUrl(){
        if(localStorage.getItem('rtmp').includes('rtmp://')){
          this.urlCache = this.formatRTMPTtoHTTP(localStorage.rtmp)
        }
      },
      formatRTMPTtoHTTP(rtmp){
        return 'http' + rtmp.slice(4).replace(/:\d+/,':8000') + '.flv'
      }
    },
    mounted () {
      this.initPullUrl()
    }
  }
</script>

<style lang="scss" scoped>
.box{
        height:100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
      }
      .inputStyle{
        width:300px;
        margin-bottom: 10px;
      }
</style>