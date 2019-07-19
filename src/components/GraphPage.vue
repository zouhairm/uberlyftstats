<template>
  
  <div class="graphs">

    <div class="permile-graph">
    <Plotly :data="perMileData" :layout="perMileLayout" ></Plotly>  
    </div> 

    <div class="dist-cost-graph">
      <Plotly :data="distanceData" :layout="distanceLayout" ></Plotly>
      <Plotly :data="costData" :layout="costLayout" ></Plotly>
    </div>

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
      distanceData: [],
      costData: [],

      costLayout: {},
      distanceLayout: {},
      perMileLayout: {},
    }
  },

  created() {
    const defaultLayout = {  
      titlefont: {
          'size': 16,
          'color': '#ffffff',
          'family': 'Open Sans'
      },            
      yaxis: {
          showticklabels: true,
          ticks:'',
          tickfont: {'color':'white'},
          title: '',
          titlefont:{'color':'white'}
      },      
      xaxis: {
          showticklabels: true,
          ticks:'',
          tickfont: {'color':'white'},
          title: 'Date',
          titlefont:{'color':'white'}
      },
      font: {'color': '#fff',},
      // legend: {'orientation':'h'},
      hovermode: 'closest',
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      // margin:{'t': 40, 'b':20 , 'r':0, 'l': 50, 'pad': 1},
      dragmode:'select',
      clickmode: 'event+select'
    }


    this.costLayout     = JSON.parse(JSON.stringify(defaultLayout)); //ugh, no deepcopy
    this.costLayout.title = 'Trip Costs';
    this.costLayout.yaxis.title = 'US $';

    this.distanceLayout = JSON.parse(JSON.stringify(defaultLayout)); //ugh, no deepcopy
    this.distanceLayout.title = 'Trip Distances'
    this.distanceLayout.yaxis.title = 'Miles';

    this.perMileLayout  = JSON.parse(JSON.stringify(defaultLayout)); //ugh, no deepcopy
    this.perMileLayout.title = 'Trip Trip Cost/Mile'
    this.perMileLayout.yaxis.title = '$/Mile';


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

          this.costData     = splitify(newParsedData.allRides, 'total_usd')
          this.distanceData = splitify(newParsedData.allRides, 'distance_miles')
          this.perMileData  = splitify(newParsedData.allRides, 'usd_per_mile')

        }
        else
        {
            this.perMileData= []
            this.distanceData= []
            this.costData= []
        }
      }
    }
  }
}

function splitify(allRides, metric)
{
  let dataTraces = []

  let taxiCompanies = [['Lyft', '#ea0a8b'], ['Uber', 'black']]

  taxiCompanies.forEach(taxi_color => {
    let taxi =taxi_color[0]
    let color = taxi_color[1]

    let rides = allRides.filter(r => r && 'taxi' in r && r.taxi == taxi)

    let dataTrace = {x: rides.map(r => r['date']),
                     y: rides.map(r => r[metric]),
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


.permilegraph{
  width: 95vw;
}

.dist-cost-graph{
  width: 95vw;
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
