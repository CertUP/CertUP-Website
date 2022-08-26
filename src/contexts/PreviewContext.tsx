import { createContext, useState, useContext, ReactElement, ReactNode } from 'react';
// import { getRandom } from '../utils/helpers';
import { nanoid } from 'nanoid'; // TODO: DELETE HERE IF IT IS NOT NECESSARY
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

export const PreviewProvider = ({ children }: Props): ReactElement => {
  // set default values
  const [NextRender, setNextRender] = useState<RenderRequest>();
  const [LastRender, setLastRender] = useState<string>();
  const [Rendering, setRendering] = useState<boolean>(contextDefaultValues.Rendering);

  const requestRender = (renderData: RenderRequest) => {
    setNextRender(renderData);
    render(renderData)
  }

  const render = async(renderData?: RenderRequest) => {
    if (!renderData) renderData = NextRender;
    if (!renderData || Rendering) {
      console.log('Skipping render');
      return;
    };
    setRendering(true);

    const limit = 3;
    let i = 0;
    while (i < limit) {
      try {
        const result = await generateImage({
          // id: NextRender.id,
          // layoutId: NextRender.layoutId,
          // input: NextRender.input,
          ...renderData
        });
        setLastRender(result);
        setRendering(false);
        return;
      } catch (error: any) {
        console.error('Error Rendering Preview: ', error)
        i++;
        if (i === limit) {
          toast.error(`Render Error: ${error.toString()}`);
        }
      }
    }


    setRendering(false);
  }

  const values = {
    requestRender,
    NextRender,
    LastRender,
    Rendering
  };

  // add values to provider to reach them out from another component
  return <PreviewContext.Provider value={values}>{children}</PreviewContext.Provider>;
};

// created custom hook
export const usePreview = () => useContext(PreviewContext);
