<template>
  
  <div class="graphs">

    <div class="permile-graph">
      <Plotly :data="perMileData" :layout="perMileLayout" ></Plotly>  
    </div> 
<!-- 
    <div class="dist-cost-graph">
      <Plotly :data="distanceData" :layout="distanceLayout" ></Plotly>
      <Plotly :data="costData" :layout="costLayout" ></Plotly>
    </div> -->

  </div>

</template>

<script>
import { Plotly } from 'vue-plotly'

export default {
  name: 'GraphPage',
  components: {
    Plotly
  },
  data()
  {
    return {
      perMileData: [],
      perMileLayout: {},
    }
  },

  created() {
    this.perMileLayout = {  
      // title: 'Trip Cost/Mile',
      titlefont: {
          'size': 16,
          'color': '#ffffff',
          'family': 'Open Sans'
      },            
      font: {'color': '#fff',},
      // legend: {'orientation':'h'},
      hovermode: 'closest',
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      margin:{'t': 40, 'b':40 , 'r':0, 'l': 50, 'pad': 1},
      dragmode:'select',
      clickmode: 'event+select',
      yaxis: {
          domain: [0.55, 1], anchor: 'x',
          title: '$/Mile',
          showticklabels: true,
          ticks:'',
          tickfont: {'color':'white'},
          titlefont:{'color':'white'}
      },  
      yaxis2: {
          domain: [0, 0.45], anchor: 'x2',
          title: '$',
          showticklabels: true,
          ticks:'',
          tickfont: {'color':'white'},
          titlefont:{'color':'white'}
      },    
      yaxis3: {
          domain: [0, 0.45], anchor: 'x3',
          title: 'Miles',
          showticklabels: true,
          ticks:'',
          tickfont: {'color':'white'},
          titlefont:{'color':'white'}
      },      
      xaxis: {
          domain: [0, 1], anchor: 'y',
          showticklabels: true,
          ticks:'',
          tickfont: {'color':'white'},
          titlefont:{'color':'white'}
      },      
      xaxis2: {
          domain: [0, 0.45], anchor: 'y2',
          showticklabels: true,
          ticks:'',
          tickfont: {'color':'white'},
          titlefont:{'color':'white'}
      },      
      xaxis3: {
          domain: [0.55, 1], anchor: 'y3',
          showticklabels: true,
          ticks:'',
          tickfont: {'color':'white'},
          titlefont:{'color':'white'}
      },
    }

  },


  props: ['parsedRideData'],
  watch:
  {
    parsedRideData:
    {
      deep: true,
      immediate: true,
      handler(newParsedData, _olddata) /* eslint-disable-line no-unused-vars */
      {
        if(newParsedData && newParsedData.allRides != null && newParsedData.allRides.length > 0)
        {
          this.perMileData       = splitify(newParsedData.allRides, 'usd_per_mile'  , '')
          this.perMileData.push(...splitify(newParsedData.allRides, 'total_usd'     , '2'))
          this.perMileData.push(...splitify(newParsedData.allRides, 'distance_miles', '3'))
          console.log(this.perMileData)
        }
        else
        {
            this.perMileData= []
        }
      }
    }
  }
}

function splitify(allRides, metric, i)
{
  let dataTraces = []

  let taxiCompanies = [['Lyft', '#ea0a8b'], ['Uber', 'black']]

  taxiCompanies.forEach(taxi_color => {
    let taxi =taxi_color[0]
    let color = taxi_color[1]

    let rides = allRides.filter(r => r && 'taxi' in r && r.taxi == taxi)

    let dataTrace = {x: rides.map(r => r['date']),
                     y: rides.map(r => r[metric]),
                     xaxis: 'x'+i, yaxis: 'y'+i,
                     name: taxi, mode: 'markers', marker: {color},
                     }

    if(metric == 'total_usd') //just for debugging ...
    {
      dataTrace.text = rides.map(r => JSON.stringify(r))
    }

    if(metric == 'usd_per_mile')
    {
      dataTrace.text = rides.map(r => '$/mile ($' + r.total_usd + ' in ' + r.distance_miles + ' miles)')
    }

    dataTraces.push(dataTrace)
  })

  //TODO: add a trend line + error bounds!

  return dataTraces
}


</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.permile-graph .js-plotly-plot{
  height: 87vh;
  margin: 0 0; 
}

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
