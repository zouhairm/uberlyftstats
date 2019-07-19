<template>
  
  <div class="graphs">

    <div class="permile-graph">
      <PlotlyVue :data="perMileData" :layout="perMileLayout" ></PlotlyVue>  
    </div> 
<!-- 
    <div class="dist-cost-graph">
      <Plotly :data="distanceData" :layout="distanceLayout" ></Plotly>
      <Plotly :data="costData" :layout="costLayout" ></Plotly>
    </div> -->

  </div>

</template>

<script>
import { Plotly as  PlotlyVue } from 'vue-plotly'
import Plotly from 'plotly.js'

var arraySort = require('array-sort');


export default {
  name: 'GraphPage',
  components: {
    PlotlyVue
  },
  data()
  {
    return {
      perMileData: [],
      perMileLayout: {},
    }
  },
  mounted(){
    var permilePlot = document.querySelector('.permile-graph .js-plotly-plot')
    permilePlot.on('plotly_hover', function (eventdata){
      // console.log('curvenumber: ',  eventdata.points[0].curveNumber);
      let c = eventdata.points[0].curveNumber
      Plotly.Fx.hover(permilePlot,
              [
                { curveNumber: c, pointNumber:eventdata.points[0].pointNumber },
                { curveNumber: c+8, pointNumber:eventdata.points[0].pointNumber },
                { curveNumber: c+8*2, pointNumber:eventdata.points[0].pointNumber },
              ],
                ['xy', 'x2y2', 'x3y3']
      );
    });
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
      legend: {'orientation':'h', 'xanchor': 'center', 'x': 0.5, 'y':1 },
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
          this.perMileData       = splitify(newParsedData, 'usd_per_mile'  , '')
          this.perMileData.push(...splitify(newParsedData, 'total_usd'     , '2'))
          this.perMileData.push(...splitify(newParsedData, 'distance_miles', '3'))
        }
        else
        {
            this.perMileData= []
        }
      }
    }
  }
}

function splitify(parsedRideData, metric, i)
{
  let dataTraces = []
  let allRides = parsedRideData.allRides
  let lumpedRides = parsedRideData.lumpedRides

  //TODO: should really be a config ...
  const taxiCompanies = [['Lyft', '#ea0a8b'], ['Uber', '#000000'], ['Uber+Lyft', '#00ffff']]

  taxiCompanies.forEach(taxi_color => {
    let taxi =taxi_color[0]
    let color = taxi_color[1]

    let rides = allRides.filter(r => r && 'taxi' in r && r.taxi == taxi)

    if(rides.length > 0)
    {
      let dataTrace = {x: rides.map(r => r.date),
                       y: rides.map(r => r[metric]),
                       xaxis: 'x'+i, yaxis: 'y'+i,
                       legendgroup: taxi, showlegend: i == 0,
                       name: taxi, mode: 'markers', marker: {color: color, opacity: .4},
                       }

      // if(metric == 'total_usd') //just for debugging ...
      // {
      //   dataTrace.text = rides.map(r => JSON.stringify(r))
      // }

      if(metric == 'usd_per_mile')
      {
        dataTrace.hoverinfo = 'text';
        dataTrace.text = rides.map(r => r.usd_per_mile.toFixed(2) + ' $/mile ($' + r.total_usd + ' in ' + r.distance_miles + ' miles)')
      }

      dataTraces.push(dataTrace)
    }

    //Now deal with stats
    if(lumpedRides && (taxi in lumpedRides))
    {
      let months_time = Object.keys(lumpedRides[taxi]).map(m=>parseInt(m)) //should be months in time int
      
      //ugh, no argsort :(
      let month_means_pairs  = months_time.map(m => Object.assign({},
                                {month_time: m, 
                                 mu: lumpedRides[taxi][m][metric+'_mu'],
                                 s: lumpedRides[taxi][m][metric+'_sigma']})) 

      month_means_pairs = arraySort(month_means_pairs, 'month_time')

      let means  = month_means_pairs.map(mmp => mmp.mu)
      let sigmas = month_means_pairs.map(mmp => mmp.s)
      let months = month_means_pairs.map(mmp => new Date(mmp.month_time)) 


      let dataTrace = {x: months, y: means, visible: taxi == 'Uber+Lyft' ? 'legendonly' : true,
                       xaxis: 'x'+i, yaxis: 'y'+i,
                      legendgroup:taxi+'_stats', showlegend: i == 0,
                       name: taxi + ' Mean', mode: 'lines', line: {shape:'spline', smoothing: .4,
                       color: color + '88'}
                      }

      if(metric == 'usd_per_mile')
      {
        dataTrace.hoverinfo = 'text';
        dataTrace.text = dataTrace.y.map(y => 'Average: ' + y.toFixed(2) + ' $/mile')
      }
      dataTraces.push(dataTrace)
      

      const f = 1.5;
      let upper = means.map(function (v, i) {return v + f*this[i];}, sigmas);
      let lower = means.map(function (v, i) {return Math.max(0, v - f*this[i]);}, sigmas);
      let y_err = upper.concat(lower.reverse())
      let months_and_rev = months.concat(months.slice().reverse())

      dataTrace = {x: months_and_rev, y: y_err, visible: taxi == 'Uber+Lyft' ? 'legendonly' : true,
                 xaxis: 'x'+i, yaxis: 'y'+i, showlegend: false, hoverinfo: 'none', legendgroup:taxi+'_stats',
                 fill:'toself', fillcolor:color + '55',
                 name: taxi+'_err', mode: 'lines', line: {shape:'spline', smoothing: .4,
                 color: color + '55'}
                }
      dataTraces.push(dataTrace)
      

      // dataTrace = {x: months, y: lower, 
      //              xaxis: 'x'+i, yaxis: 'y'+i, showlegend: false, hoverinfo: 'none', legendgroup:taxi+'_stats',
      //              name: taxi+'_lower', mode: 'lines', line: {//shape:'spline', 
      //              color: color + '55', opacity: .5}
      //             }
      // dataTraces.push(dataTrace)
    } 

  })

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
