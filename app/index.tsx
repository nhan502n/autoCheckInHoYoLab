// app/page.tsx
import React, { useState } from "react";
import { View, Text, Button, ScrollView, Alert } from "react-native";
import { checkIn } from "../scripts/checkin";

export default function App() {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [executionTime, setExecutionTime] = useState<number | null>(null);

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
