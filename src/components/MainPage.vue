<template>
  
  <div class="graphs">
    
    <Plotly :data="timeData" :layout="timeLayout" ></Plotly>

  </div>

</template>

<script>
import { Plotly } from 'vue-plotly'

export default {
  name: 'MainPages',
  components: {
    Plotly
  },
  data()
  {
    return {
      timeData: [{x: [1,2,3], y:[1,2,3]}, {x:[1,2,3], y:[-1,-2,-3]}],
      timeLayout: {'title': 'Miles / Ride' },
      counter: 0,
    }
  },

  props: ['emailData'],
  watch:
  {
    emailData:
    {
      deep: true,
      immediate: true,
      handler(newData, _olddata) /* eslint-disable-line no-unused-vars */
      {
        if(this.emailData)
        {
          this.timeData = [{x: [1,2,3], y:[1,this.emailData.counter, this.emailData.counter]}]; 
        }
        else
        {
          this.timeData = [{x: [1,2,3], y:[1,0,0]}]; 
        }
        this.counter += 1
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>




h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}

</style>
