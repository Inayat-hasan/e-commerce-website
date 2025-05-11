import { useDispatch, useSelector } from "react-redux";

const useAppDispatch = () => useDispatch();
const useAppSelector = (selector) => useSelector(selector);

export { useAppDispatch, useAppSelector };
