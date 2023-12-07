import * as Location from "expo-location";
import { Fontisto } from "@expo/vector-icons";
import { StyleSheet, Dimensions, ActivityIndicator, ScrollView, View, Text } from "react-native";
import React, { useState, useEffect } from "react";
const { width: SCREEN_WIDTH } = Dimensions.get("window");

const API_KEY = "7d09a1d740aa2076e5e8a23031ece27e";

const icons = {
  Clouds: "cloudy",
  Clear: "day-sunny",
  Atmosphere: "cloudy-gusts",
  Snow: "snow",
  Rain: "rains",
  Drizzle: "rain",
  Thunderstorm: "lightning",
};

export default function App() {
  const [city, setCity] = useState("잠시만 기다려주세요"); // 지역
  const [days, setDays] = useState([]); // 날씨 정보들 담을 배열
  const [ok, setOk] = useState(true); // 유저 위치 공유 허락 여부

  // 컴포넌트 마운트 시 getWeather() 호출
  useEffect(() => {
    getWeather();
  }, []);

  // 공공 API를 통해 비동기로 데이터를 받아옴
  const getWeather = async () => {
    const { granted } = await Location.requestForegroundPermissionsAsync();
    // 유저가 권한 허가를 안했을 때
    if (!granted) {
      setOk(false);
    }

    // 유저가 허락하면 유저의 위도, 경도 정보를 받을 수 있음
    const {
      coords: { latitude, longitude },
    } = await Location.getCurrentPositionAsync({ accuracy: 5 });

    // reverseGeocode는 위도, 경도를 통해 주소를 알아냄
    const location = await Location.reverseGeocodeAsync({ latitude, longitude }, { useGoogleMaps: false });

    setCity(location[0].city); // 알아낸 주소를 화면에 띄우기 위해 세팅해줌

    // 위도, 경도를 알아냈다면 API를 호출 (openWeather)
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&exclude=alerts&appid=${API_KEY}&units=metric`
    );
    const json = await response.json();
    setDays(json.list);
  };

  return (
    <View style={styles.container}>
      <View style={styles.city}>
        <Text style={styles.cityName}>{city}</Text>
      </View>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.weather}
      >
        {days.length === 0 ? (
          <View style={{ ...styles.day, alignItems: "center" }}>
            <ActivityIndicator color="white" size="large" style={{ marginTop: 10 }} />
          </View>
        ) : (
          days.map((day, index) => (
            <View key={index} style={styles.day}>
              <View
                style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "100%" }}
              >
                <Text style={styles.temp}>{parseFloat(day.main.temp).toFixed(1)}</Text>
                <Fontisto name={icons[day.weather[0].main]} size={78} color="white" style={{ paddingRight: 30 }} />
              </View>
              <Text style={styles.description}>{day.weather[0].main}</Text>
              <Text style={styles.tinyText}>{day.weather[0].description}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "tomato",
  },
  city: {
    color: "white",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  weather: {},
  cityName: {
    color: "white",
    fontSize: 38,
    fontWeight: "500",
  },
  day: {
    width: SCREEN_WIDTH,
    alignItems: "left",
    paddingLeft: 30,
  },
  temp: {
    color: "white",
    marginTop: 50,
    fontSize: 108,
  },
  description: {
    color: "white",
    marginTop: -30,
    fontSize: 60,
  },
  tinyText: {
    color: "white",
    fontSize: 30,
  },
});
