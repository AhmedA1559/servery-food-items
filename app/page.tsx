import Table from "./table";
import { fetchMenuData } from "./utils/fetchData";

export default async function Home() {
  const data = await fetchMenuData();
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Rice Servery Viewer</h1>
      <Table data={data.weeklyMenu} />
    </div>
  );
}
