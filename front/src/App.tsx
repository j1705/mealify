import { Routes, Route } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import { ToastProvider } from "./components/ui/ToastProvider";
import HomePage from "./pages/HomePage";
import ItemsPage from "./pages/items/ItemsPage";
import ItemCreatePage from "./pages/items/ItemCreatePage";
import ItemEditPage from "./pages/items/ItemEditPage";
import MealsPage from "./pages/meals/MealsPage";
import MealCreatePage from "./pages/meals/MealCreatePage";
import MealEditPage from "./pages/meals/MealEditPage";
import MealDetailsPage from "./pages/meals/MealDetailsPage";

function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/items" element={<ItemsPage />} />
          <Route path="/items/new" element={<ItemCreatePage />} />
          <Route path="/items/:itemId/edit" element={<ItemEditPage />} />
          <Route path="/meals" element={<MealsPage />} />
          <Route path="/meals/new" element={<MealCreatePage />} />
          <Route path="/meals/:mealId" element={<MealDetailsPage />} />
          <Route path="/meals/:mealId/edit" element={<MealEditPage />} />
        </Route>
      </Routes>
    </ToastProvider>
  );
}

export default App;
