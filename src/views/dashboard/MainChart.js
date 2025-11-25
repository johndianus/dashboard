import React, { useEffect, useRef } from 'react'

import { CChartLine } from '@coreui/react-chartjs'
import { getStyle } from '@coreui/utils'

const MainChart = () => {
  const chartRef = useRef(null)

  useEffect(() => {
    document.documentElement.addEventListener('ColorSchemeChange', () => {
      if (chartRef.current) {
        setTimeout(() => {
          chartRef.current.options.scales.x.grid.borderColor = getStyle(
            '--cui-border-color-translucent',
          )
          chartRef.current.options.scales.x.grid.color = getStyle('--cui-border-color-translucent')
          chartRef.current.options.scales.x.ticks.color = getStyle('--cui-body-color')
          chartRef.current.options.scales.y.grid.borderColor = getStyle(
            '--cui-border-color-translucent',
          )
          chartRef.current.options.scales.y.grid.color = getStyle('--cui-border-color-translucent')
          chartRef.current.options.scales.y.ticks.color = getStyle('--cui-body-color')
          chartRef.current.update()
        })
      }
    })
  }, [chartRef])

  const random = () => Math.round(Math.random() * 100)

  const rawData  = [
    {
      "month": "April 2025",
      "vanid": 169,
      "total_vouchers": 515,
      "total_amount": "66794.51"
    },
    {
      "month": "April 2025",
      "vanid": 170,
      "total_vouchers": 622,
      "total_amount": "86985.85"
    },
    {
      "month": "April 2025",
      "vanid": 179,
      "total_vouchers": 620,
      "total_amount": "42877.59"
    },
    {
      "month": "April 2025",
      "vanid": 180,
      "total_vouchers": 619,
      "total_amount": "37741.04"
    },
    {
      "month": "April 2025",
      "vanid": 181,
      "total_vouchers": 756,
      "total_amount": "36624.60"
    },
    {
      "month": "April 2025",
      "vanid": 182,
      "total_vouchers": 424,
      "total_amount": "36031.80"
    },
    {
      "month": "April 2025",
      "vanid": 2749,
      "total_vouchers": 420,
      "total_amount": "45167.80"
    },
    {
      "month": "December 2024",
      "vanid": 169,
      "total_vouchers": 522,
      "total_amount": "47760.39"
    },
    {
      "month": "December 2024",
      "vanid": 170,
      "total_vouchers": 552,
      "total_amount": "58557.90"
    },
    {
      "month": "December 2024",
      "vanid": 179,
      "total_vouchers": 594,
      "total_amount": "43289.79"
    },
    {
      "month": "December 2024",
      "vanid": 180,
      "total_vouchers": 661,
      "total_amount": "35138.75"
    },
    {
      "month": "December 2024",
      "vanid": 181,
      "total_vouchers": 565,
      "total_amount": "26605.40"
    },
    {
      "month": "December 2024",
      "vanid": 182,
      "total_vouchers": 589,
      "total_amount": "34530.30"
    },
    {
      "month": "December 2024",
      "vanid": 2749,
      "total_vouchers": 409,
      "total_amount": "36202.70"
    },
    {
      "month": "February 2025",
      "vanid": 169,
      "total_vouchers": 448,
      "total_amount": "52110.28"
    },
    {
      "month": "February 2025",
      "vanid": 170,
      "total_vouchers": 583,
      "total_amount": "75586.60"
    },
    {
      "month": "February 2025",
      "vanid": 179,
      "total_vouchers": 515,
      "total_amount": "39876.12"
    },
    {
      "month": "February 2025",
      "vanid": 180,
      "total_vouchers": 631,
      "total_amount": "38677.16"
    },
    {
      "month": "February 2025",
      "vanid": 181,
      "total_vouchers": 763,
      "total_amount": "35730.45"
    },
    {
      "month": "February 2025",
      "vanid": 182,
      "total_vouchers": 512,
      "total_amount": "34419.00"
    },
    {
      "month": "February 2025",
      "vanid": 2749,
      "total_vouchers": 451,
      "total_amount": "42587.18"
    },
    {
      "month": "January 2025",
      "vanid": 169,
      "total_vouchers": 547,
      "total_amount": "57811.67"
    },
    {
      "month": "January 2025",
      "vanid": 170,
      "total_vouchers": 654,
      "total_amount": "83281.00"
    },
    {
      "month": "January 2025",
      "vanid": 179,
      "total_vouchers": 633,
      "total_amount": "46641.75"
    },
    {
      "month": "January 2025",
      "vanid": 180,
      "total_vouchers": 766,
      "total_amount": "45742.61"
    },
    {
      "month": "January 2025",
      "vanid": 181,
      "total_vouchers": 769,
      "total_amount": "36851.20"
    },
    {
      "month": "January 2025",
      "vanid": 182,
      "total_vouchers": 591,
      "total_amount": "38830.40"
    },
    {
      "month": "January 2025",
      "vanid": 2749,
      "total_vouchers": 492,
      "total_amount": "45217.44"
    },
    {
      "month": "March 2025",
      "vanid": 169,
      "total_vouchers": 417,
      "total_amount": "47553.52"
    },
    {
      "month": "March 2025",
      "vanid": 170,
      "total_vouchers": 577,
      "total_amount": "76754.85"
    },
    {
      "month": "March 2025",
      "vanid": 179,
      "total_vouchers": 461,
      "total_amount": "30625.95"
    },
    {
      "month": "March 2025",
      "vanid": 180,
      "total_vouchers": 515,
      "total_amount": "32104.50"
    },
    {
      "month": "March 2025",
      "vanid": 181,
      "total_vouchers": 678,
      "total_amount": "32680.70"
    },
    {
      "month": "March 2025",
      "vanid": 182,
      "total_vouchers": 359,
      "total_amount": "26204.30"
    },
    {
      "month": "March 2025",
      "vanid": 2749,
      "total_vouchers": 348,
      "total_amount": "31079.68"
    },
    {
      "month": "May 2025",
      "vanid": 169,
      "total_vouchers": 207,
      "total_amount": "23409.02"
    },
    {
      "month": "May 2025",
      "vanid": 170,
      "total_vouchers": 401,
      "total_amount": "49979.30"
    },
    {
      "month": "May 2025",
      "vanid": 179,
      "total_vouchers": 350,
      "total_amount": "26646.07"
    },
    {
      "month": "May 2025",
      "vanid": 180,
      "total_vouchers": 195,
      "total_amount": "11360.46"
    },
    {
      "month": "May 2025",
      "vanid": 181,
      "total_vouchers": 517,
      "total_amount": "24065.80"
    },
    {
      "month": "May 2025",
      "vanid": 182,
      "total_vouchers": 335,
      "total_amount": "25204.98"
    },
    {
      "month": "May 2025",
      "vanid": 2749,
      "total_vouchers": 248,
      "total_amount": "26996.40"
    }
  ];
  const grouped = {};
  rawData.forEach(entry => {
    const { vanid, month, total_amount } = entry;
    if (!grouped[vanid]) {
      grouped[vanid] = [];
    }
    grouped[vanid].push({ month, vanid, total_amount });
  });
  
  // Extract all months in order
  const allMonths = [...new Set(rawData.map(d => d.month))]
    .sort((a, b) => new Date(`1 ${a}`) - new Date(`1 ${b}`));
  
  // Prepare Chart.js datasets
  const datasets = Object.entries(grouped).map(([vanid, data]) => {
    // Create a month-to-amount map for this vanid
    const monthMap = Object.fromEntries(
      data.map(d => [d.month, parseFloat(d.total_amount)])
    );
  
    return {
      label: vanid,
      backgroundColor: 'transparent',//`rgba(${getStyle('--cui-info-rgb')}, .1)`,
      borderColor: getStyle('--cui-info'),
      pointHoverBackgroundColor: getStyle('--cui-info'),
      borderWidth: 2,
      //fill: true,
      data: allMonths.map(month => monthMap[month] || 0)
    };
  });
  
  // You can now use `allMonths` as your labels and `datasets` in Chart.js
  console.log({ datasets });

  return (
    <>
      <CChartLine
        ref={chartRef}
        style={{ height: '300px', marginTop: '40px' }}
        data={{
          labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
          datasets: datasets,
          /*datasets: [
            {
              label: 'My First dataset',
              backgroundColor: `rgba(${getStyle('--cui-info-rgb')}, .1)`,
              borderColor: getStyle('--cui-info'),
              pointHoverBackgroundColor: getStyle('--cui-info'),
              borderWidth: 2,
              data: [
                random(50, 200),
                random(50, 200),
                random(50, 200),
                random(50, 200),
                random(50, 200),
                random(50, 200),
                random(50, 200),
              ],
              fill: true,
            },
            {
              label: 'My Second dataset',
              backgroundColor: 'transparent',
              borderColor: getStyle('--cui-success'),
              pointHoverBackgroundColor: getStyle('--cui-success'),
              borderWidth: 2,
              data: [
                random(50, 200),
                random(50, 200),
                random(50, 200),
                random(50, 200),
                random(50, 200),
                random(50, 200),
                random(50, 200),
              ],
            },
            {
              label: 'My Third dataset',
              backgroundColor: 'transparent',
              borderColor: getStyle('--cui-danger'),
              pointHoverBackgroundColor: getStyle('--cui-danger'),
              borderWidth: 1,
              borderDash: [8, 5],
              data: [65, 65, 65, 65, 65, 65, 65],
            },
          ],*/
        }}
        options={{
          maintainAspectRatio: false,
          interaction: {
            mode: 'dataset', // show only hovered dataset
            intersect: true, // only trigger when directly over a point
          },
          plugins: {
            legend: {
              display: true,
            },
            tooltip: {
              mode: 'index',
              intersect: false,
            },
          },
          scales: {
            x: {
              grid: {
                color: getStyle('--cui-border-color-translucent'),
                drawOnChartArea: false,
              },
              ticks: {
                color: getStyle('--cui-body-color'),
              },
            },
            y: {
              beginAtZero: true,
              border: {
                color: getStyle('--cui-border-color-translucent'),
              },
              grid: {
                color: getStyle('--cui-border-color-translucent'),
              },
              //max: 250,
              max: 100000,
              ticks: {
                color: getStyle('--cui-body-color'),
                maxTicksLimit: 5,
                //stepSize: Math.ceil(250 / 5),
                stepSize: Math.ceil(100000 / 2000),
              },
            },
          },
          elements: {
            line: {
              tension: 0.4,
            },
            point: {
              radius: 0,
              hitRadius: 10,
              hoverRadius: 4,
              hoverBorderWidth: 3,
            },
          },
        }}
      />
    </>
  )
}

export default MainChart
