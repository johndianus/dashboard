import React, {useState, useEffect} from 'react';
import { CChart } from '@coreui/react-chartjs';
import { dba, fetchJson, baseURL } from '../../utilities/api';
import { getSessionValue } from '../../utilities/session';

// main.jsx or wherever your app starts
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);


const groupDataByPeriod = (data) => {
  const periodMap = {};

  data?.forEach(({ period, vanid, total_vouchers, total_amount }) => {
    if (!periodMap[period]) {
      periodMap[period] = {};
    }

    periodMap[period][vanid] = {
      total_vouchers: Number(total_vouchers),
      total_amount: Number(total_amount),
    };
  });

  return periodMap;
};


const buildChartData = (groupedData, monthData, vanData, valueKey) => {
  const periods = Object.keys(groupedData);

  const vanIds = Array.from(
    new Set(monthData?.map((item) => item.vanid))
  );

  const vanNameMap = vanData?.reduce((acc, van) => {
    acc[van.id] = van.name;
    return acc;
  }, {});

  const datasets = vanIds?.map((vanid, index) => ({
    label: (vanNameMap && vanNameMap[vanid]) || `Van ${vanid}`,
    data: periods?.map(period => {
      const entry = groupedData[period]?.[vanid];
      return entry ? entry[valueKey] : 0;
    }),
    //backgroundColor: `hsl(${index * 50 % 360}, 70%, 50%)`,
    //backgroundColor: `hsl(${index * 40 % 360}, 40%, 45%)`,
    //backgroundColor: `hsl(${index * 35 % 360}, 30%, 50%)`
    //backgroundColor: `hsl(${index * 45 % 360}, 35%, 40%)`
    backgroundColor: `hsl(${index * 30 % 360}, 50%, 75%)`
    //backgroundColor: `hsl(${index * 45 % 360}, 35%, 40%)`

  }));

  return {
    labels: periods,
    datasets
  };
};

const MainChartNew = ({selPeriod, selView}) => {
  const [vanData, setVanData] = useState([]);
  const [monthData, setMonthData] = useState([]);
  const selViewParm = selView === "Count" ? "total_vouchers" : "total_amount"
  const groupedData = groupDataByPeriod(monthData);
  const chartData = buildChartData(groupedData, monthData, vanData, selViewParm);

  useEffect(()=>{
    const init = async () => {
      const vans = await getSessionValue("vans");
      /*const data = await fetchJson(
      `${baseURL}dailyvansales?db=${dba}&period=${selPeriod.toLowerCase()}`
      );*/
      const data = []
      setVanData(vans?.data);
      setMonthData(data?.data);
    }
    init();
  },[selPeriod])

  if (vanData?.length === 0 || monthData?.length === 0) {
    return <div>Loading chart...</div>;
  }

  console.log('Chart Data:', chartData);

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 via-white to-gray-100 rounded-2xl shadow-md">
      <h2 className="text-xl mb-4">{selView === "Count" ? "Total Vouchers by Van and Period":"Total Sales by Van and Period"}</h2>
      <CChart
        type="bar"
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: 'Voucher Distribution per Van by Period',
            },
          },
        }}
        style={{ height: '400px' }} // ✅ Add height here
      />
    </div>
  );
};

export default MainChartNew;
