// AppNavigator.js
import { createStackNavigator } from "@react-navigation/stack";
import SurveyList from "./SurveyList";
import SurveyDetail from "./SurveyDetail";

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="SurveyList" component={SurveyList} options={{ title: "Surveys" }} />
      <Stack.Screen name="SurveyDetail" component={SurveyDetail} options={{ title: "Survey" }} />
    </Stack.Navigator>
  );
}
