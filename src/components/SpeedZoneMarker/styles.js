import { StyleSheet } from "react-native";
import colors from "../../config/colors";

export default StyleSheet.create({
  markerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  speedText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  unitText: {
    color: colors.white,
    fontSize: 6,
    fontWeight: "600",
    marginTop: -2,
  },
  calloutContainer: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 12,
    minWidth: 150,
    alignItems: "center",
  },
  calloutTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.black,
    marginBottom: 4,
  },
  calloutSpeed: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 4,
  },
  calloutUnit: {
    fontSize: 12,
    color: "#666",
  },
  distanceText: {
    fontSize: 11,
    color: "#888",
    marginTop: 4,
  },
});
