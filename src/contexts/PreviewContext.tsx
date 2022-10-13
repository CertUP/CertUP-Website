import { createContext, useState, useContext, ReactElement, ReactNode, useEffect } from 'react';
import { generateImage, GenerateInput } from '../utils/backendHelper';
import { toast } from 'react-toastify';

interface Props {
  children: ReactNode;
}

interface RenderRequest {
  id: string;
  layoutId: number;
  input: GenerateInput;
}

export interface PreviewContextState {
  NextRender?: RenderRequest;
  LastRender?: string;
  LastGeneric?: string;
  Rendering: boolean;
  requestRender: (renderData: RenderRequest) => void;
}

// set default values for initializing
const contextDefaultValues: PreviewContextState = {
  Rendering: false,
  requestRender: function (renderData: RenderRequest): void {
    throw new Error('Function not implemented.');
  },
};

// created context with default values
const PreviewContext = createContext<PreviewContextState>(contextDefaultValues);

let NextRender: RenderRequest | undefined;
let running = false;

export const PreviewProvider = ({ children }: Props): ReactElement => {
  // set default values
  //const [NextRender, setNextRender] = useState<RenderRequest>();
  const [LastRender, setLastRender] = useState<string>();
  const [LastGeneric, setLastGeneric] = useState<string>();
  const [Rendering, setRendering] = useState<boolean>(contextDefaultValues.Rendering);

  const requestRender = (renderData: RenderRequest) => {
    NextRender = renderData;
    runQueue();
  };

  const runQueue = async () => {
    if (running) return;
    running = true;
    while (NextRender) {
      const thisRender = { ...NextRender };
      NextRender = undefined;
      await render(thisRender);
    }
    running = false;
  };

  const render = async (renderData: RenderRequest) => {
    setRendering(true);

    const limit = 3;
    let i = 0;
    while (i < limit) {
      try {
        const result = await generateImage({
          // id: NextRender.id,
          // layoutId: NextRender.layoutId,
          // input: NextRender.input,
          ...renderData,
        });
        setLastRender(result[0]);
        setLastGeneric(result[1]);
        setRendering(false);
        break;
      } catch (error: any) {
        console.error('Error Rendering Preview: ', error);
        i++;
        if (i === limit) {
          toast.error(`Render Error: ${error.toString()}`);
          setRendering(false);
        }
      }
    }
  };

  const values = {
    requestRender,
    NextRender,
    LastRender,
    LastGeneric,
    Rendering,
  };

  // add values to provider to reach them out from another component
  return <PreviewContext.Provider value={values}>{children}</PreviewContext.Provider>;
};

// created custom hook
export const usePreview = () => useContext(PreviewContext);
