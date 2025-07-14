// app/page.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { checkIn } from "../scripts/checkin";

export default function App() {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [checkinTime, setCheckinTime] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem("checkinTime");
      if (saved) setCheckinTime(new Date(saved));
    })();
  }, []);

  const handleCheckIn = async () => {
    setLoading(true);
    setResult("");
    setExecutionTime(null);
    const start = Date.now();
    const res = await checkIn();
    const end = Date.now();
    const duration = (end - start) / 1000;
    setResult(res);
    setExecutionTime(duration);
    setLoading(false);

    Alert.alert("Kết quả check-in", res);
  };

  const handleTimeChange = async (_: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) {
      setCheckinTime(selectedDate);
      await AsyncStorage.setItem("checkinTime", selectedDate.toISOString());
      Alert.alert("Đã lưu giờ auto check-in", selectedDate.toLocaleTimeString());
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        backgroundColor: "#f2f2f2",
        padding: 20,
        justifyContent: "center",
      }}
    >
      <View style={{ alignItems: "center" }}>
        <Button
          title={loading ? "Đang check-in..." : "Check-In Tự Động"}
          onPress={handleCheckIn}
          disabled={loading}
        />

        <View style={{ marginVertical: 20 }} />

        <Text style={{ fontSize: 16, marginBottom: 8 }}>
          Chọn giờ auto check-in:
        </Text>
        <Button
          title={checkinTime ? checkinTime.toLocaleTimeString() : "Chọn giờ"}
          onPress={() => setShowPicker(true)}
        />
        {showPicker && (
          <DateTimePicker
            value={checkinTime || new Date()}
            mode="time"
            is24Hour={true}
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={handleTimeChange}
          />
        )}

        <View style={{ marginVertical: 20 }} />

        {executionTime !== null && (
          <Text style={{ marginBottom: 10, color: "#666" }}>
            Thời gian thực thi: {executionTime.toFixed(2)} giây
          </Text>
        )}
        {result !== "" && (
          <Text selectable style={{ color: "#333", fontSize: 16 }}>
            {result}
          </Text>
        )}
      </View>
    </ScrollView>
  );
}