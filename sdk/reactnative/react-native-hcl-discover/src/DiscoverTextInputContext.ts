import { createContext, useContext } from 'react';
import {
  TextInput as RNTextInput,
} from 'react-native';

export type DiscoverTextInputHandler = (
  event: unknown,
  eventName: string,
  textInput: React.ElementRef<typeof RNTextInput> | null

) => void;

export const DiscoverTextInputContext =
  createContext<DiscoverTextInputHandler | null>(null);

export const useDiscoverTextInputHandler = () =>
  useContext(DiscoverTextInputContext);