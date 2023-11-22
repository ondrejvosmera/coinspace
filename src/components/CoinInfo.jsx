import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { HistoricalChart, SingleCoin } from '../config/api.js';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { chartDays } from '../config/chartData.js';
import ChartButtons from './ChartButtons.jsx';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);


const CoinInfo = () => {

    const { id } = useParams();
    const [coin, setCoin] = useState()
    const [historicalData, setHistoricalData] = useState();
    const [days, setDays] = useState(1);
  
    const fetchCoin = async () => {
      try {
        const response = await fetch(SingleCoin(id));
        if (response.ok) {
          const data = await response.json();
          setCoin(data);
        } else {
          console.error('Failed to fetch ticker tape data');
        }
      } catch (error) {
        console.error('An error occurred while fetching data:', error);
      }
    };
  
    useEffect(() => {
      fetchCoin();
    }, [days]);

    const fetchHistoricalData = async () => {
      try {
        const response = await fetch(HistoricalChart(id, days));
        if (response.ok) {
          const data = await response.json();
          setHistoricalData(data.prices);
        } else {
          console.error('Failed to fetch Historical data');
        }
      } catch (error) {
        console.error('An error occurred while fetching data:', error);
      }
    };

    useEffect(() => {
      fetchHistoricalData();
    }, [days]);

    if (!coin || !historicalData) {
      return <div>Loading...</div>;
    }

  return (
    <div className="coin-info-container">
      <div className="left-col">
        <img src={coin.image.large} alt={coin.name} />
        <h1 className='title'>{coin.name}</h1>
        <p>Rank: {coin.market_cap_rank}</p>
        <p>Price: ${coin.market_data.current_price.usd}</p>
        <p>Market cap: ${coin.market_data.market_cap.usd.toLocaleString()}</p>
        <p>{coin.description.en}</p>
      </div>
      <div className="right-col">
        {
          !historicalData ? (<p>Loading...</p>
          ) : (
          <>
          <Line
          data = {{
            labels: historicalData.map((coin) => {
              let date = new Date(coin[0]);
              let time = date.getHours() > 12
              ? `${date.getHours() - 12} : ${date.getMinutes()} PM`
              : `${date.getHours()} : ${date.getMinutes()} AM`

              return days === 1 ? time : date.toLocaleDateString()
            }),

            datasets: [
              {
                data: historicalData.map((coin) => coin[1]),
                label: `Price (Past ${days} Days)`,
                borderColor: "#00BCE3"
              }
            ]
          }}
          options={{
            elements: {
              point: {
                radius: 1,
              }
            }
          }}
          />
          <div>
            {chartDays.map((day) => (
              <ChartButtons key={day.value} OnClick={() => setDays(day.value)} selected={day.value === days}>
                {day.label}
              </ChartButtons>
            ))}
          </div>
          </>
          )
        }
      </div>
    </div>
  )
}

export default CoinInfo;