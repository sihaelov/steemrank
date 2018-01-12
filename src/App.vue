<template>
  <div id="app">
    <!-- <nav></nav> -->
    <el-menu :default-active="$route.path" mode="horizontal" :router="true">
      <el-menu-item v-for="rule in $router.options.routes" :index="rule.path" :key="rule.path">
        {{rule.name.charAt(0).toUpperCase() + rule.name.slice(1)}}
      </el-menu-item>

      <span style="float: right; margin: 0; margin-right: 20px; line-height: 60px;">
        Built by <a href="https://steemit.com/@emptyname" target="_blank">@emptyname</a>
      </span>
    </el-menu>

    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'app',
  data() {
    return {
    };
  },
  methods: {
  },
};
</script>

<style>

body{
  background-color: rgb(250, 250, 250);
  margin-bottom: 100px;
}

</style>
