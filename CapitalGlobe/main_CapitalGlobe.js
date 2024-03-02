var getScriptPromisify = src => {
  return new Promise(resolve => {
    $.getScript(src, resolve)
  })
}

;(function () {
  const prepared = document.createElement('template')
  prepared.innerHTML = `
          <style>
          </style>
          <div id="root" style="width: 100%; height: 100%;">
          </div>
        `

  class CustomCapitalGlobe extends HTMLElement {
    constructor () {
      super()
      this._shadowRoot = this.attachShadow({ mode: 'open' })
      this._shadowRoot.appendChild(prepared.content.cloneNode(true))
      this._root = this._shadowRoot.getElementById('root')
      this._props = {}
      this.render()
    }

    onCustomWidgetBeforeUpdate (changedProperties) {
      this._props = { ...this._props, ...changedProperties }
    }

    onCustomWidgetAfterUpdate (changedProperties) {
      if ('myDataBinding' in changedProperties) {
          this.myDataBinding = changedProperties["myDataBinding"];
      }
      // console.log('hello1')
      // console.log(this.myDataBinding)
    }

    onCustomWidgetResize (width, height) {
      this.render()
    }

    addLocationDimension (Latitude, Longitude) {
      this.latitude = Latitude
      this.longitude = Longitude
    }

    async render () {
      await getScriptPromisify('https://cdn.amcharts.com/lib/5/index.js')
      await getScriptPromisify('https://cdn.amcharts.com/lib/5/map.js')
      await getScriptPromisify(
        'https://cdn.amcharts.com/lib/5/geodata/worldLow.js'
      )
      await getScriptPromisify(
        'https://cdn.amcharts.com/lib/5/themes/Animated.js'
      )

      // console.log("Before Data Binding State Check");

      if (!this.myDataBinding || this.myDataBinding.state !== 'success') {
        return;
      }

      console.log('Data Binding Success')
      // console.log(this.myDataBinding)

      var root = am5.Root.new(this._root);

      // Set themes
      // https://www.amcharts.com/docs/v5/concepts/themes/
      root.setThemes([am5themes_Animated.new(root)])

      // Create the map chart
      // https://www.amcharts.com/docs/v5/charts/map-chart/
      var chart = root.container.children.push(
        am5map.MapChart.new(root, {
          panX: 'rotateX',
          panY: 'none',
          projection: am5map.geoMercator()
        })
      )

      var cont = chart.children.push(
        am5.Container.new(root, {
          layout: root.horizontalLayout,
          x: 20,
          y: 40
        })
      )

      // Add labels and controls
      cont.children.push(
        am5.Label.new(root, {
          centerY: am5.p50,
          text: 'Map'
        })
      )

      var switchButton = cont.children.push(
        am5.Button.new(root, {
          themeTags: ['switch'],
          centerY: am5.p50,
          icon: am5.Circle.new(root, {
            themeTags: ['icon']
          })
        })
      )

      switchButton.on('active', function () {
        if (!switchButton.get('active')) {
          chart.set('projection', am5map.geoMercator())
          chart.set('panY', 'translateY')
          chart.set('rotationY', 0)

          backgroundSeries.mapPolygons.template.set('fillOpacity', 0)
        } else {
          chart.set('projection', am5map.geoOrthographic())
          chart.set('panY', 'rotateY')
          backgroundSeries.mapPolygons.template.set('fillOpacity', 0.1)
        }
      })

      cont.children.push(
        am5.Label.new(root, {
          centerY: am5.p50,
          text: 'Globe'
        })
      )

      // Create series for background fill
      // https://www.amcharts.com/docs/v5/charts/map-chart/map-polygon-series/#Background_polygon
      var backgroundSeries = chart.series.push(
        am5map.MapPolygonSeries.new(root, {})
      )
      backgroundSeries.mapPolygons.template.setAll({
        fill: root.interfaceColors.get('alternativeBackground'),
        fillOpacity: 0,
        strokeOpacity: 0
      })

      // Add background polygon
      // https://www.amcharts.com/docs/v5/charts/map-chart/map-polygon-series/#Background_polygon
      backgroundSeries.data.push({
        geometry: am5map.getGeoRectangle(90, 180, -90, -180)
      })

      // Create main polygon series for countries
      // https://www.amcharts.com/docs/v5/charts/map-chart/map-polygon-series/
      var polygonSeries = chart.series.push(
        am5map.MapPolygonSeries.new(root, {
          geoJSON: am5geodata_worldLow
        })
      )

      // Create line series for trajectory lines
      // https://www.amcharts.com/docs/v5/charts/map-chart/map-line-series/
      var lineSeries = chart.series.push(am5map.MapLineSeries.new(root, {}))
      lineSeries.mapLines.template.setAll({
        stroke: root.interfaceColors.get('alternativeBackground'),
        strokeOpacity: 0.3
      })

      // Create point series for markers
      // https://www.amcharts.com/docs/v5/charts/map-chart/map-point-series/
      var pointSeries = chart.series.push(am5map.MapPointSeries.new(root, {}))

      pointSeries.bullets.push(function () {
        var circle = am5.Circle.new(root, {
          radius: 4,
          tooltipY: 0,
          fill: am5.color(0xffba00),
          stroke: root.interfaceColors.get('background'),
          strokeWidth: 2,
          tooltipText: '{title}'
        })

        return am5.Bullet.new(root, {
          sprite: circle
        })
      })

      var cities = []

      for(var i = 0; i < this.myDataBinding.data.length; i++) {
        cities.push({
          title: this.myDataBinding.data[i].dimensions_0.id,
          latitude: this.myDataBinding.data[i].measures_0.raw,
          longitude: this.myDataBinding.data[i].measures_1.raw
        });
      }

      console.log("Cities");
      console.log(cities);

      // var cities = [
      //   {
      //     title: 'Vienna',
      //     latitude: 48.2092,
      //     longitude: 16.3728
      //   },
      //   {
      //     title: 'Minsk',
      //     latitude: 53.9678,
      //     longitude: 27.5766
      //   },
      //   {
      //     title: 'Brussels',
      //     latitude: 50.8371,
      //     longitude: 4.3676
      //   },
      //   {
      //     title: 'Sarajevo',
      //     latitude: 43.8608,
      //     longitude: 18.4214
      //   },
      //   {
      //     title: 'Sofia',
      //     latitude: 42.7105,
      //     longitude: 23.3238
      //   },
      //   {
      //     title: 'Zagreb',
      //     latitude: 45.815,
      //     longitude: 15.9785
      //   },
      //   {
      //     title: 'Pristina',
      //     latitude: 42.666667,
      //     longitude: 21.166667
      //   },
      //   {
      //     title: 'Prague',
      //     latitude: 50.0878,
      //     longitude: 14.4205
      //   },
      //   {
      //     title: 'Copenhagen',
      //     latitude: 55.6763,
      //     longitude: 12.5681
      //   },
      //   {
      //     title: 'Tallinn',
      //     latitude: 59.4389,
      //     longitude: 24.7545
      //   },
      //   {
      //     title: 'Helsinki',
      //     latitude: 60.1699,
      //     longitude: 24.9384
      //   },
      //   {
      //     title: 'Paris',
      //     latitude: 48.8567,
      //     longitude: 2.351
      //   },
      //   {
      //     title: 'Berlin',
      //     latitude: 52.5235,
      //     longitude: 13.4115
      //   },
      //   {
      //     title: 'Athens',
      //     latitude: 37.9792,
      //     longitude: 23.7166
      //   },
      //   {
      //     title: 'Budapest',
      //     latitude: 47.4984,
      //     longitude: 19.0408
      //   },
      //   {
      //     title: 'Reykjavik',
      //     latitude: 64.1353,
      //     longitude: -21.8952
      //   },
      //   {
      //     title: 'Dublin',
      //     latitude: 53.3441,
      //     longitude: -6.2675
      //   },
      //   {
      //     title: 'Rome',
      //     latitude: 41.8955,
      //     longitude: 12.4823
      //   },
      //   {
      //     title: 'Riga',
      //     latitude: 56.9465,
      //     longitude: 24.1049
      //   },
      //   {
      //     title: 'Vaduz',
      //     latitude: 47.1411,
      //     longitude: 9.5215
      //   },
      //   {
      //     title: 'Vilnius',
      //     latitude: 54.6896,
      //     longitude: 25.2799
      //   },
      //   {
      //     title: 'Luxembourg',
      //     latitude: 49.61,
      //     longitude: 6.1296
      //   },
      //   {
      //     title: 'Skopje',
      //     latitude: 42.0024,
      //     longitude: 21.4361
      //   },
      //   {
      //     title: 'Valletta',
      //     latitude: 35.9042,
      //     longitude: 14.5189
      //   },
      //   {
      //     title: 'Chisinau',
      //     latitude: 47.0167,
      //     longitude: 28.8497
      //   },
      //   {
      //     title: 'Monaco',
      //     latitude: 43.7325,
      //     longitude: 7.4189
      //   },
      //   {
      //     title: 'Podgorica',
      //     latitude: 42.4602,
      //     longitude: 19.2595
      //   },
      //   {
      //     title: 'Amsterdam',
      //     latitude: 52.3738,
      //     longitude: 4.891
      //   },
      //   {
      //     title: 'Oslo',
      //     latitude: 59.9138,
      //     longitude: 10.7387
      //   },
      //   {
      //     title: 'Warsaw',
      //     latitude: 52.2297,
      //     longitude: 21.0122
      //   },
      //   {
      //     title: 'Lisbon',
      //     latitude: 38.7072,
      //     longitude: -9.1355
      //   },
      //   {
      //     title: 'Bucharest',
      //     latitude: 44.4479,
      //     longitude: 26.0979
      //   },
      //   {
      //     title: 'Moscow',
      //     latitude: 55.7558,
      //     longitude: 37.6176
      //   },
      //   {
      //     title: 'San Marino',
      //     latitude: 43.9424,
      //     longitude: 12.4578
      //   },
      //   {
      //     title: 'Belgrade',
      //     latitude: 44.8048,
      //     longitude: 20.4781
      //   },
      //   {
      //     title: 'Bratislava',
      //     latitude: 48.2116,
      //     longitude: 17.1547
      //   },
      //   {
      //     title: 'Ljubljana',
      //     latitude: 46.0514,
      //     longitude: 14.506
      //   },
      //   {
      //     title: 'Madrid',
      //     latitude: 40.4167,
      //     longitude: -3.7033
      //   },
      //   {
      //     title: 'Stockholm',
      //     latitude: 59.3328,
      //     longitude: 18.0645
      //   },
      //   {
      //     title: 'Bern',
      //     latitude: 46.948,
      //     longitude: 7.4481
      //   },
      //   {
      //     title: 'Kiev',
      //     latitude: 50.4422,
      //     longitude: 30.5367
      //   },
      //   {
      //     title: 'London',
      //     latitude: 51.5002,
      //     longitude: -0.1262
      //   },
      //   {
      //     title: 'Gibraltar',
      //     latitude: 36.1377,
      //     longitude: -5.3453
      //   },
      //   {
      //     title: 'Saint Peter Port',
      //     latitude: 49.466,
      //     longitude: -2.5522
      //   },
      //   {
      //     title: 'Douglas',
      //     latitude: 54.167,
      //     longitude: -4.4821
      //   },
      //   {
      //     title: 'Saint Helier',
      //     latitude: 49.1919,
      //     longitude: -2.1071
      //   },
      //   {
      //     title: 'Longyearbyen',
      //     latitude: 78.2186,
      //     longitude: 15.6488
      //   },
      //   {
      //     title: 'Kabul',
      //     latitude: 34.5155,
      //     longitude: 69.1952
      //   },
      //   {
      //     title: 'Yerevan',
      //     latitude: 40.1596,
      //     longitude: 44.509
      //   },
      //   {
      //     title: 'Baku',
      //     latitude: 40.3834,
      //     longitude: 49.8932
      //   },
      //   {
      //     title: 'Manama',
      //     latitude: 26.1921,
      //     longitude: 50.5354
      //   },
      //   {
      //     title: 'Dhaka',
      //     latitude: 23.7106,
      //     longitude: 90.3978
      //   },
      //   {
      //     title: 'Thimphu',
      //     latitude: 27.4405,
      //     longitude: 89.673
      //   },
      //   {
      //     title: 'Bandar Seri Begawan',
      //     latitude: 4.9431,
      //     longitude: 114.9425
      //   },
      //   {
      //     title: 'Phnom Penh',
      //     latitude: 11.5434,
      //     longitude: 104.8984
      //   },
      //   {
      //     title: 'Peking',
      //     latitude: 39.9056,
      //     longitude: 116.3958
      //   },
      //   {
      //     title: 'Nicosia',
      //     latitude: 35.1676,
      //     longitude: 33.3736
      //   },
      //   {
      //     title: "T'bilisi",
      //     latitude: 41.701,
      //     longitude: 44.793
      //   },
      //   {
      //     title: 'New Delhi',
      //     latitude: 28.6353,
      //     longitude: 77.225
      //   },
      //   {
      //     title: 'Jakarta',
      //     latitude: -6.1862,
      //     longitude: 106.8063
      //   },
      //   {
      //     title: 'Teheran',
      //     latitude: 35.7061,
      //     longitude: 51.4358
      //   },
      //   {
      //     title: 'Baghdad',
      //     latitude: 33.3157,
      //     longitude: 44.3922
      //   },
      //   {
      //     title: 'Jerusalem',
      //     latitude: 31.76,
      //     longitude: 35.17
      //   },
      //   {
      //     title: 'Tokyo',
      //     latitude: 35.6785,
      //     longitude: 139.6823
      //   },
      //   {
      //     title: 'Amman',
      //     latitude: 31.9394,
      //     longitude: 35.9349
      //   },
      //   {
      //     title: 'Astana',
      //     latitude: 51.1796,
      //     longitude: 71.4475
      //   },
      //   {
      //     title: 'Kuwait',
      //     latitude: 29.3721,
      //     longitude: 47.9824
      //   },
      //   {
      //     title: 'Bishkek',
      //     latitude: 42.8679,
      //     longitude: 74.5984
      //   },
      //   {
      //     title: 'Vientiane',
      //     latitude: 17.9689,
      //     longitude: 102.6137
      //   },
      //   {
      //     title: 'Beyrouth / Beirut',
      //     latitude: 33.8872,
      //     longitude: 35.5134
      //   },
      //   {
      //     title: 'Kuala Lumpur',
      //     latitude: 3.1502,
      //     longitude: 101.7077
      //   },
      //   {
      //     title: 'Ulan Bator',
      //     latitude: 47.9138,
      //     longitude: 106.922
      //   },
      //   {
      //     title: 'Pyinmana',
      //     latitude: 19.7378,
      //     longitude: 96.2083
      //   },
      //   {
      //     title: 'Kathmandu',
      //     latitude: 27.7058,
      //     longitude: 85.3157
      //   },
      //   {
      //     title: 'Muscat',
      //     latitude: 23.6086,
      //     longitude: 58.5922
      //   },
      //   {
      //     title: 'Islamabad',
      //     latitude: 33.6751,
      //     longitude: 73.0946
      //   },
      //   {
      //     title: 'Manila',
      //     latitude: 14.579,
      //     longitude: 120.9726
      //   },
      //   {
      //     title: 'Doha',
      //     latitude: 25.2948,
      //     longitude: 51.5082
      //   },
      //   {
      //     title: 'Riyadh',
      //     latitude: 24.6748,
      //     longitude: 46.6977
      //   },
      //   {
      //     title: 'Singapore',
      //     latitude: 1.2894,
      //     longitude: 103.85
      //   },
      //   {
      //     title: 'Seoul',
      //     latitude: 37.5139,
      //     longitude: 126.9828
      //   },
      //   {
      //     title: 'Colombo',
      //     latitude: 6.9155,
      //     longitude: 79.8572
      //   },
      //   {
      //     title: 'Damascus',
      //     latitude: 33.5158,
      //     longitude: 36.2939
      //   },
      //   {
      //     title: 'Taipei',
      //     latitude: 25.0338,
      //     longitude: 121.5645
      //   },
      //   {
      //     title: 'Dushanbe',
      //     latitude: 38.5737,
      //     longitude: 68.7738
      //   },
      //   {
      //     title: 'Bangkok',
      //     latitude: 13.7573,
      //     longitude: 100.502
      //   },
      //   {
      //     title: 'Dili',
      //     latitude: -8.5662,
      //     longitude: 125.588
      //   },
      //   {
      //     title: 'Ankara',
      //     latitude: 39.9439,
      //     longitude: 32.856
      //   },
      //   {
      //     title: 'Ashgabat',
      //     latitude: 37.9509,
      //     longitude: 58.3794
      //   },
      //   {
      //     title: 'Abu Dhabi',
      //     latitude: 24.4764,
      //     longitude: 54.3705
      //   },
      //   {
      //     title: 'Tashkent',
      //     latitude: 41.3193,
      //     longitude: 69.2481
      //   },
      //   {
      //     title: 'Hanoi',
      //     latitude: 21.0341,
      //     longitude: 105.8372
      //   },
      //   {
      //     title: 'Sanaa',
      //     latitude: 15.3556,
      //     longitude: 44.2081
      //   },
      //   {
      //     title: 'Buenos Aires',
      //     latitude: -34.6118,
      //     longitude: -58.4173
      //   },
      //   {
      //     title: 'Bridgetown',
      //     latitude: 13.0935,
      //     longitude: -59.6105
      //   },
      //   {
      //     title: 'Belmopan',
      //     latitude: 17.2534,
      //     longitude: -88.7713
      //   },
      //   {
      //     title: 'Sucre',
      //     latitude: -19.0421,
      //     longitude: -65.2559
      //   },
      //   {
      //     title: 'Brasilia',
      //     latitude: -15.7801,
      //     longitude: -47.9292
      //   },
      //   {
      //     title: 'Ottawa',
      //     latitude: 45.4235,
      //     longitude: -75.6979
      //   },
      //   {
      //     title: 'Santiago',
      //     latitude: -33.4691,
      //     longitude: -70.642
      //   },
      //   {
      //     title: 'Bogota',
      //     latitude: 4.6473,
      //     longitude: -74.0962
      //   },
      //   {
      //     title: 'San Jose',
      //     latitude: 9.9402,
      //     longitude: -84.1002
      //   },
      //   {
      //     title: 'Havana',
      //     latitude: 23.1333,
      //     longitude: -82.3667
      //   },
      //   {
      //     title: 'Roseau',
      //     latitude: 15.2976,
      //     longitude: -61.39
      //   },
      //   {
      //     title: 'Santo Domingo',
      //     latitude: 18.479,
      //     longitude: -69.8908
      //   },
      //   {
      //     title: 'Quito',
      //     latitude: -0.2295,
      //     longitude: -78.5243
      //   },
      //   {
      //     title: 'San Salvador',
      //     latitude: 13.7034,
      //     longitude: -89.2073
      //   },
      //   {
      //     title: 'Guatemala',
      //     latitude: 14.6248,
      //     longitude: -90.5328
      //   },
      //   {
      //     title: 'Ciudad de Mexico',
      //     latitude: 19.4271,
      //     longitude: -99.1276
      //   },
      //   {
      //     title: 'Managua',
      //     latitude: 12.1475,
      //     longitude: -86.2734
      //   },
      //   {
      //     title: 'Panama',
      //     latitude: 8.9943,
      //     longitude: -79.5188
      //   },
      //   {
      //     title: 'Asuncion',
      //     latitude: -25.3005,
      //     longitude: -57.6362
      //   },
      //   {
      //     title: 'Lima',
      //     latitude: -12.0931,
      //     longitude: -77.0465
      //   },
      //   {
      //     title: 'Castries',
      //     latitude: 13.9972,
      //     longitude: -60.0018
      //   },
      //   {
      //     title: 'Paramaribo',
      //     latitude: 5.8232,
      //     longitude: -55.1679
      //   },
      //   {
      //     title: 'Washington D.C.',
      //     latitude: 38.8921,
      //     longitude: -77.0241
      //   },
      //   {
      //     title: 'Montevideo',
      //     latitude: -34.8941,
      //     longitude: -56.0675
      //   },
      //   {
      //     title: 'Caracas',
      //     latitude: 10.4961,
      //     longitude: -66.8983
      //   },
      //   {
      //     title: 'Oranjestad',
      //     latitude: 12.5246,
      //     longitude: -70.0265
      //   },
      //   {
      //     title: 'Cayenne',
      //     latitude: 4.9346,
      //     longitude: -52.3303
      //   },
      //   {
      //     title: 'Plymouth',
      //     latitude: 16.6802,
      //     longitude: -62.2014
      //   },
      //   {
      //     title: 'San Juan',
      //     latitude: 18.45,
      //     longitude: -66.0667
      //   },
      //   {
      //     title: 'Algiers',
      //     latitude: 36.7755,
      //     longitude: 3.0597
      //   },
      //   {
      //     title: 'Luanda',
      //     latitude: -8.8159,
      //     longitude: 13.2306
      //   },
      //   {
      //     title: 'Porto-Novo',
      //     latitude: 6.4779,
      //     longitude: 2.6323
      //   },
      //   {
      //     title: 'Gaborone',
      //     latitude: -24.657,
      //     longitude: 25.9089
      //   },
      //   {
      //     title: 'Ouagadougou',
      //     latitude: 12.3569,
      //     longitude: -1.5352
      //   },
      //   {
      //     title: 'Bujumbura',
      //     latitude: -3.3818,
      //     longitude: 29.3622
      //   },
      //   {
      //     title: 'Yaounde',
      //     latitude: 3.8612,
      //     longitude: 11.5217
      //   },
      //   {
      //     title: 'Bangui',
      //     latitude: 4.3621,
      //     longitude: 18.5873
      //   },
      //   {
      //     title: 'Brazzaville',
      //     latitude: -4.2767,
      //     longitude: 15.2662
      //   },
      //   {
      //     title: 'Kinshasa',
      //     latitude: -4.3369,
      //     longitude: 15.3271
      //   },
      //   {
      //     title: 'Yamoussoukro',
      //     latitude: 6.8067,
      //     longitude: -5.2728
      //   },
      //   {
      //     title: 'Djibouti',
      //     latitude: 11.5806,
      //     longitude: 43.1425
      //   },
      //   {
      //     title: 'Cairo',
      //     latitude: 30.0571,
      //     longitude: 31.2272
      //   },
      //   {
      //     title: 'Asmara',
      //     latitude: 15.3315,
      //     longitude: 38.9183
      //   },
      //   {
      //     title: 'Addis Abeba',
      //     latitude: 9.0084,
      //     longitude: 38.7575
      //   },
      //   {
      //     title: 'Libreville',
      //     latitude: 0.3858,
      //     longitude: 9.4496
      //   },
      //   {
      //     title: 'Banjul',
      //     latitude: 13.4399,
      //     longitude: -16.6775
      //   },
      //   {
      //     title: 'Accra',
      //     latitude: 5.5401,
      //     longitude: -0.2074
      //   },
      //   {
      //     title: 'Conakry',
      //     latitude: 9.537,
      //     longitude: -13.6785
      //   },
      //   {
      //     title: 'Bissau',
      //     latitude: 11.8598,
      //     longitude: -15.5875
      //   },
      //   {
      //     title: 'Nairobi',
      //     latitude: -1.2762,
      //     longitude: 36.7965
      //   },
      //   {
      //     title: 'Maseru',
      //     latitude: -29.2976,
      //     longitude: 27.4854
      //   },
      //   {
      //     title: 'Monrovia',
      //     latitude: 6.3106,
      //     longitude: -10.8047
      //   },
      //   {
      //     title: 'Tripoli',
      //     latitude: 32.883,
      //     longitude: 13.1897
      //   },
      //   {
      //     title: 'Antananarivo',
      //     latitude: -18.9201,
      //     longitude: 47.5237
      //   },
      //   {
      //     title: 'Lilongwe',
      //     latitude: -13.9899,
      //     longitude: 33.7703
      //   },
      //   {
      //     title: 'Bamako',
      //     latitude: 12.653,
      //     longitude: -7.9864
      //   },
      //   {
      //     title: 'Nouakchott',
      //     latitude: 18.0669,
      //     longitude: -15.99
      //   },
      //   {
      //     title: 'Port Louis',
      //     latitude: -20.1654,
      //     longitude: 57.4896
      //   },
      //   {
      //     title: 'Rabat',
      //     latitude: 33.9905,
      //     longitude: -6.8704
      //   },
      //   {
      //     title: 'Maputo',
      //     latitude: -25.9686,
      //     longitude: 32.5804
      //   },
      //   {
      //     title: 'Windhoek',
      //     latitude: -22.5749,
      //     longitude: 17.0805
      //   },
      //   {
      //     title: 'Niamey',
      //     latitude: 13.5164,
      //     longitude: 2.1157
      //   },
      //   {
      //     title: 'Abuja',
      //     latitude: 9.058,
      //     longitude: 7.4891
      //   },
      //   {
      //     title: 'Kigali',
      //     latitude: -1.9441,
      //     longitude: 30.0619
      //   },
      //   {
      //     title: 'Dakar',
      //     latitude: 14.6953,
      //     longitude: -17.4439
      //   },
      //   {
      //     title: 'Freetown',
      //     latitude: 8.4697,
      //     longitude: -13.2659
      //   },
      //   {
      //     title: 'Mogadishu',
      //     latitude: 2.0411,
      //     longitude: 45.3426
      //   },
      //   {
      //     title: 'Pretoria',
      //     latitude: -25.7463,
      //     longitude: 28.1876
      //   },
      //   {
      //     title: 'Mbabane',
      //     latitude: -26.3186,
      //     longitude: 31.141
      //   },
      //   {
      //     title: 'Dodoma',
      //     latitude: -6.167,
      //     longitude: 35.7497
      //   },
      //   {
      //     title: 'Lome',
      //     latitude: 6.1228,
      //     longitude: 1.2255
      //   },
      //   {
      //     title: 'Tunis',
      //     latitude: 36.8117,
      //     longitude: 10.1761
      //   }
      // ]

      for (var i = 0; i < cities.length; i++) {
        var city = cities[i]
        addCity(city.longitude, city.latitude, city.title)
      }

      function addCity (longitude, latitude, title) {
        pointSeries.data.push({
          geometry: { type: 'Point', coordinates: [longitude, latitude] },
          title: title
        })
      }

      // Make stuff animate on load
      chart.appear(1000, 100)
    }
  }

  customElements.define('custom-capital-globe', CustomCapitalGlobe)
})()
