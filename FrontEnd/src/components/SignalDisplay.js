import React, { useEffect, useRef, useState } from 'react';

const SignalDisplay = ({ data, xRange = [0, 0.2], yRange = [-8, 8], id = "mi-grafico" }) => {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const dataSeriesRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  // Primer efecto: Verificar si el contenedor y SciChart están disponibles
  useEffect(() => {
    const checkReadiness = () => {
      const container = document.getElementById(id);
      if (container && window.SciChart) {
        setIsReady(true);
      } else {
        setTimeout(checkReadiness, 100);
      }
    };

    checkReadiness();

    return () => {
      if (chartRef.current) {
        chartRef.current.delete();
        chartRef.current = null;
      }
    };
  }, []);

  // Segundo efecto: Inicializar SciChart solo cuando todo esté listo
  useEffect(() => {
    if (!isReady) return;

    let isComponentMounted = true;

    const initSciChart = async () => {
      try {
        const { SciChartSurface, NumericAxis, FastLineRenderableSeries, XyDataSeries, NumberRange } = window.SciChart;

        const { sciChartSurface, wasmContext } = await SciChartSurface.create(id);

        if (!isComponentMounted) {
          sciChartSurface.delete();
          return;
        }

        sciChartSurface.background = "#121212";

        const xAxis = new NumericAxis(wasmContext, {
          axisTitle: "Tiempo (s)",
          labelStyle: { color: "#e0e0e0" },
          titleStyle: { color: "#e0e0e0" },
          majorGridLineStyle: { color: "#333", strokeThickness: 1 },
          tickLabelStyle: { color: "#e0e0e0" },
          visibleRange: new NumberRange(xRange[0], xRange[1])
        });

        const yAxis = new NumericAxis(wasmContext, {
          axisTitle: "Amplitud",
          labelStyle: { color: "#e0e0e0" },
          titleStyle: { color: "#e0e0e0" },
          majorGridLineStyle: { color: "#333", strokeThickness: 1 },
          tickLabelStyle: { color: "#e0e0e0" },
          visibleRange: new NumberRange(yRange[0], yRange[1])
        });

        sciChartSurface.xAxes.add(xAxis);
        sciChartSurface.yAxes.add(yAxis);

        const dataSeries = new XyDataSeries(wasmContext);
        const lineSeries = new FastLineRenderableSeries(wasmContext, {
          dataSeries,
          stroke: "#4CAF50",
          strokeThickness: 2.5
        });

        sciChartSurface.renderableSeries.add(lineSeries);

        chartRef.current = sciChartSurface;
        dataSeriesRef.current = dataSeries;

        console.log("SciChart inicializado correctamente en:", id);
      } catch (error) {
        console.error("Error inicializando SciChart:", error);
      }
    };

    initSciChart();

    return () => {
      isComponentMounted = false;
    };
  }, [isReady]);

  // Tercer efecto: Actualizar los datos cuando cambian
  useEffect(() => {
    if (dataSeriesRef.current && data?.t?.length > 0 && data?.señal?.length > 0) {
      dataSeriesRef.current.clear();

      const maxIndex = data.t.findIndex(t => t >= xRange[1]);
      const endIndex = maxIndex > 0 ? maxIndex : data.t.length;

      const tSlice = data.t.slice(0, endIndex);
      const señalSlice = data.señal.slice(0, endIndex);

      dataSeriesRef.current.appendRange(tSlice, señalSlice);
    }
  }, [data, xRange]);

  return <div id={id} ref={containerRef} style={{ width: '100%', height: '250px', backgroundColor: '#121212' }}></div>;
};

export default SignalDisplay;
