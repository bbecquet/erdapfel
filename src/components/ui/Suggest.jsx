import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import debounce from 'lodash.debounce';
import { bool, string, func, object } from 'prop-types';

import SuggestsDropdown from 'src/components/ui/SuggestsDropdown';
import { fetchSuggests, getInputValue, selectItem, modifyList } from 'src/libs/suggest';
import { useDevice } from 'src/hooks';

const SUGGEST_DEBOUNCE_WAIT = 100;

const Suggest = ({
  inputNode,
  outputNode,
  withCategories,
  withGeoloc,
  onSelect = selectItem,
  onClear,
  onChange,
  className,
  onClose,
  onOpen,
}) => {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [lastQuery, setLastQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { isMobile } = useDevice();

  const close = () => {
    setIsOpen(false);
    setItems([]);
  };

  useEffect(() => {
    if (onClose && !isOpen) {
      onClose();
    }

    if (onOpen && isOpen) {
      onOpen();
    }
  }, [isOpen, onClose, onOpen]);

  useEffect(() => {
    let currentQuery = null;

    const handleFocus = () => {
      if (inputNode.value === '') {
        setIsOpen(true);
        fetchItems('');
      } else {
        if (isMobile) {
          setIsOpen(true);
          fetchItems(inputNode.value);
        }
      }
    };

    const handleBlur = () => {
      close();
    };

    // @WARNING: don't use anonymous functions as onClear/onChange props,
    // otherwise this side-effect will be re-run at each render,
    // recreating this each time so queries won't be properly debounced
    const fetchItems = debounce(value => {
      if (currentQuery) {
        currentQuery.abort();
      }

      setIsLoading(true);
      const query = fetchSuggests(value, {
        withCategories,
      });

      currentQuery = query;

      query
        .then(suggestions => modifyList(suggestions, withGeoloc && value === '', value))
        .then(items => {
          setItems(items);
          currentQuery = null;
          setIsLoading(false);
        })
        .catch(() => {
          /* Query aborted. Just ignore silently */
        });
    }, SUGGEST_DEBOUNCE_WAIT);

    const handleInput = e => {
      const { value } = e.target;
      fetchItems(value);
      setIsOpen(true);
      setLastQuery(value);

      if (onChange) {
        onChange(value);
      }
    };

    const handleKeyDown = async event => {
      if (event.key === 'Esc' || event.key === 'Escape') {
        if (inputNode.value === '' && !isMobile) {
          close();
        } else {
          inputNode.value = '';
          fetchItems('');
          setIsOpen(true);
        }

        if (onClear) {
          onClear();
        }
      }
    };

    inputNode.addEventListener('focus', handleFocus);
    inputNode.addEventListener('blur', handleBlur);
    inputNode.addEventListener('input', handleInput);
    inputNode.addEventListener('keydown', handleKeyDown);

    return () => {
      inputNode.removeEventListener('focus', handleFocus);
      inputNode.removeEventListener('blur', handleBlur);
      inputNode.removeEventListener('input', handleInput);
      inputNode.removeEventListener('keydown', handleKeyDown);
    };
  }, [inputNode, onClear, withCategories, withGeoloc, isMobile, onChange]);

  if (!isOpen) {
    return null;
  }

  const SuggestsDropdownElement = () => (
    <SuggestsDropdown
      className={className}
      suggestItems={items}
      isLoading={isLoading}
      onHighlight={item => {
        if (!item) {
          inputNode.value = lastQuery;
        } else {
          inputNode.value = getInputValue(item);
        }
      }}
      onSelect={item => {
        inputNode.value = getInputValue(item);
        inputNode.blur();
        close();
        if (onSelect) {
          onSelect(item, { query: inputNode.value });
        }
      }}
      onClear={onClear}
    />
  );

  return ReactDOM.createPortal(<SuggestsDropdownElement />, outputNode);
};

Suggest.propTypes = {
  inputNode: object.isRequired,
  outputNode: object.isRequired,
  withCategories: bool,
  withGeoloc: bool,
  onSelect: func,
  onClear: func,
  onOpen: func,
  onClose: func,
  onChange: func,
  className: string,
};

export default Suggest;
