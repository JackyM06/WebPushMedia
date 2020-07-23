<template>
    <div class="h-100 d-flex flex-column jc-around ai-center">
        <div class="text-center">
          <h1 class="mb-3">流媒体采集</h1>
          <button id="mainEl" class="mr-2" @click="selectMode(0,$event)" disabled>麦克风推流</button>
          <button class="mr-2" @click="selectMode(1,$event)">指定文件推流</button>
          <!-- <button @click="selectMode(2,$event)">视频录制推流</button> -->
        </div>
        <!-- <div>
          
        </div> -->
        <div class="d-flex flex-column ai-center" style="width:60%">
            <audio-push v-if="currentSelect === 0" ></audio-push>
            <file-push v-if="currentSelect === 1" ></file-push>
            <video-push v-if="currentSelect === 2" ></video-push>
        </div>
        <router-link tag="a" target="_blank" to="/pull" >采集结果</router-link>
    </div>
</template>

<script>
    import AudioPush from './AudioPush.vue'
    import FilePush from './FilePush.vue'
    import VideoPush from './VideoPush.vue'
    export default {
      data () {
        return {
          currentSelect:0,
          element:null
        }
      },
      components:{
          AudioPush,
          VideoPush,
          FilePush
      },
      methods: {
        selectMode(index,event){
          if(this.element){this.element.removeAttribute('disabled')}
          this.currentSelect = index
          this.element = event.target
          this.element.setAttribute("disabled","disabled")
        }
      },
      mounted(){
        this.element = document.getElementById("mainEl")
      }
    }
</script>

<style lang="scss" scoped>

</style>