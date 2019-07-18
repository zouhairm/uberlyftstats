<template>
  
  <div class="graphs">

    <Plotly :data="perMileData" :layout="perMileLayout" ></Plotly>    
    <Plotly :data="distanceData" :layout="distanceLayout" ></Plotly>
    <Plotly :data="costData" :layout="costLayout" ></Plotly>
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

      costLayout: {'title': 'Trip Costs (US$)' },
      distanceLayout: {'title': 'Trip Distances (Miles)' },
      perMileLayout: {'title': 'Normalized Trip Costs (US$/Mile)' },
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

  let taxiCompanies = ['Lyft', 'Uber']

  taxiCompanies.forEach(taxi => {
    let rides = allRides.filter(r => r && 'taxi' in r && r.taxi == taxi)

    let dataTrace = {x: rides.map(r => r['date']),
                     y: rides.map(r => r[metric]),
                     name: taxi, mode: 'markers',
                     }

    if(metric == 'total_usd')
    {
      dataTrace.text = rides.map(r => JSON.stringify(r))
    }

    dataTraces.push(dataTrace)
  })

  //TODO: add a trend line + error bounds!

  return dataTraces
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
