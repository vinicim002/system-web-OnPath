import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  useFonts,
} from "@expo-google-fonts/inter";
import { Slot } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";

import { MenuLateral } from "@/components/MenuLateral";
import { PreparoPrimeiroUso } from "@/components/PreparoPrimeiroUso";
import { ServicosProvider } from "@/dados/ServicosProvider";
import { cores } from "@/theme";

SplashScreen.preventAutoHideAsync();

export default function LayoutRaiz() {
  const [fontesProntas, erroFontes] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });
  const pronto = fontesProntas || erroFontes !== null;

  useEffect(() => {
    if (pronto) SplashScreen.hideAsync();
  }, [pronto]);

  if (!pronto) return null;

  return (
    <ServicosProvider>
      <View style={estilos.moldura}>
        <MenuLateral />
        <View style={estilos.conteudo}>
          <PreparoPrimeiroUso>
            <Slot />
          </PreparoPrimeiroUso>
        </View>
      </View>
    </ServicosProvider>
  );
}

const estilos = StyleSheet.create({
  moldura: {
    flex: 1,
    flexDirection: "row",
    height: "100%",
    backgroundColor: cores.branco,
  },
  conteudo: {
    flex: 1,
  },
});
