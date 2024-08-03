import Table from "./table";
import { fetchMenuData } from "./utils/fetchData";

export default async function Home() {
  const data = await fetchMenuData();
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between flex-wrap">
        <h1 className="text-3xl font-bold mb-8">Rice Servery Viewer</h1>
        <a
          href="https://groupme.com/join_group/102053547/xeK5pqzT"
          target="_blank"
          rel="noopener noreferrer"
        >
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Join GroupMe for automated menu updates
          </button>
        </a>
      </div>
      <Table data={data} />
    </div>
  );
}
