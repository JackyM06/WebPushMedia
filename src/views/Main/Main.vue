<template>
    <div class="h-100 d-flex flex-column jc-around ai-center">
        <h1>流媒体采集</h1>
        <div class="d-flex flex-column ai-center" style="width:60%">
            <audio-push></audio-push>
            <!-- <video-push></video-push> -->
        </div>
        <router-link tag="a" target="_blank" to="/pull" >采集结果</router-link>
    </div>
</template>

<script>
    import AudioPush from './AudioPush.vue'
    // import VideoPush from './VideoPush.vue'
    export default {
      components:{
          AudioPush,
          // VideoPush
      }
    }
</script>

<style lang="scss" scoped>

</style>