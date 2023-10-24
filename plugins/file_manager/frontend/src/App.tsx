import "./App.css";
import FileTree from "./components/FileTree/FileTree";

const testFileTree = [
  {
    name: "Project-final.psd",
  },
  {
    name: "新建文件夹",
    children: [
      {
        name: "Project-final.pdf",
      },

      {
        name: "新建文件夹",
        children: [
          {
            name: "Project-final.jpeg",
          },
          {
            name: "Project-final.png",
          },
        ],
      },
      {
        name: "Project-final.mp4",
      },
    ],
  },
  {
    name: "Project-final.txt",
  },
];

function App() {
  return (
    <>
      <FileTree data={testFileTree} />
    </>
  );
}

export default App;
