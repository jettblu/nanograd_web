import {
  CloseCircleOutlined,
  MinusCircleOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";

export default function SelectLayers(params: {
  changeHandler: (val: Uint32Array) => any;
}) {
  const { changeHandler } = params;
  const [layers, setLayers] = useState<Uint32Array>(new Uint32Array([2, 3]));
  function handleAddLayer(newSize: number) {
    // update uint32layers
    const newLayers = new Uint32Array(layers.length + 1);
    newLayers.set(layers);
    newLayers[newLayers.length - 1] = newSize;
    setLayers(newLayers);
  }
  function handleRemoveLayer(index: number) {
    setLayers(layers.filter((_, i) => i != index));
  }
  function handleIncrementLayerSize(index: number) {
    setLayers(
      layers.map((size, i) => {
        if (i == index) {
          return size + 1;
        }
        return size;
      })
    );
  }
  function handleDecrementLayerSize(index: number) {
    setLayers(
      layers.map((size, i) => {
        if (i == index) {
          return size - 1;
        }
        return size;
      })
    );
  }
  function getLayers() {
    // return array of tuples with size and index
    const res = [];
    for (let i = 0; i < layers.length; i++) {
      res.push([layers[i], i]);
    }
    return res;
  }
  useEffect(() => {
    changeHandler(layers);
  }, [layers]);
  return (
    <div className="w-full bg-gray-500/10 transition-colors duration-500 ring-2 ring-gray-700/20 rounded-md">
      <p className="text-sm text-left py-1 px-1 rounded-tr-md rounded-tl-md">
        Hidden Layers
      </p>
      <div className="flex flex-col space-y-2 divide-y-2 divide-gray-500/10">
        {getLayers().map(([size, index]) => (
          <Layer
            key={index}
            size={size}
            index={index}
            handleRemoveLayer={handleRemoveLayer}
            handleIncrementSize={handleIncrementLayerSize}
            handleDecrementSize={handleDecrementLayerSize}
          />
        ))}
      </div>
      <div
        className="bg-gray-500/10 rounded-br-md rounded-bl-md px-2 py-3 hover:cursor-pointer mt-4 hover:bg-purple-900/10 transition-colors duration-500"
        onClick={() => handleAddLayer(3)}
      >
        Add Layer
      </div>
    </div>
  );
}

function Layer(params: {
  size: number;
  index: number;
  handleRemoveLayer: (index: number) => void;
  handleIncrementSize: (index: number) => void;
  handleDecrementSize: (index: number) => void;
}) {
  const {
    size,
    index,
    handleRemoveLayer,
    handleDecrementSize,
    handleIncrementSize,
  } = params;
  function remove() {
    handleRemoveLayer(index);
  }
  return (
    <div className="flex flex-row px-1 hover:brightness-120 transition-colors duration-100 group">
      <div className="flex flex-col pt-2 space-y-3">
        <div>
          <p className="text-gray-500 text-sm group-hover:text-gray-300 transition-colors duration-100">
            Layer {index}
          </p>
        </div>
        <div className={`grid grid-cols-8 gap-2`}>
          {Array.from({ length: size }, (_, i) => (
            <Neuron key={i} />
          ))}
        </div>
        <div className="flex flex-row space-x-3">
          <MinusCircleOutlined
            className="text-gray-400/20 group-hover:text-gray-400/70 hover:cursor-pointer transition-colors duration-100"
            onClick={() => handleDecrementSize(index)}
          />
          <span className="text-gray-500 group-hover:text-gray-300 text-sm transition-colors duration-100">
            {size}
          </span>
          <PlusCircleOutlined
            className="text-purple-500/20 group-hover:text-purple-500/70 hover:cursor-pointer transition-colors duration-100"
            onClick={() => handleIncrementSize(index)}
          />
        </div>
      </div>
      <div className="flex-grow">
        <CloseCircleOutlined
          className="float-right text-red-500/20 group-hover:text-red-500/70 hover:cursor-pointer mt-2 transition-colors duration-100"
          onClick={() => remove()}
        />
      </div>
    </div>
  );
}

function Neuron() {
  return (
    <div className="w-4 h-4 rounded-full bg-gradient-to-br from-purple-700 to-gray-500"></div>
  );
}
