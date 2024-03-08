<script setup>
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { onMounted } from 'vue';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)
const props = defineProps({
  title : {
    type: String,
    required: false,
    default: 'Data'
  },
  chartOptions: {
    type: Object,
    required: true
  }
});
const colors = [
  "#00ff00",
  "#0000ff",
  "#fd7600",
  "#fd1200",
  "#fc004f",
  "#ef00b3",
  "#7200d7",
  "#1800b3",
  "#00a5ff"
];

const chartRef = ref(null);
const data = ref({  
  labels: [],
  datasets: [ 
    {
      label: props.title,
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 1,
      data: []
    }
  ]
});
const chartStyle = ref({
  width: '100%',
  height: '100%',
  position: 'relative'
});
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  layout: {
      padding: {
          bottom: 42
      }
  }  
};
onMounted(() => {
  console.log('chartRef', chartRef.value);
})
const appendData = async (value, label) => {
  chartData.labels.push(label)
  chartData.datasets[0].data.push(value)
  chartRef.value.update()
}
const clearData = async () => {
  chartData.labels = []
  chartData.datasets[0].data = []
}
defineExpose({
  appendData,
  clearData
})
</script>
<template>
  <Line ref="chartRef" :style="chartStyle" :chartData="data" :chartOptions="chartOptions" /> 
</template>
