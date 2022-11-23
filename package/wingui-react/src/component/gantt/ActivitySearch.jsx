import React, {useState, useEffect, useRef, useImperativeHandle, forwardRef} from 'react';
import './activitysearch.css';

function ActivitySearch(props, ref) {
  const anchor = useRef(null);
  const blurTimeoutRef = useRef(null);
  const orderIdInputRef = useRef(null);
  const [params, setParams] = useState({order: '', item: ''});
  const [orderItemSearchMsg, setOrderItemSearchMsg] = useState('');
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (show) {
      orderIdInputRef.current.focus();
    }
  }, [show]);

  useImperativeHandle(ref, () => ({
    refresh: () => refreshSearch()
  }));

  function searchActivity(e) {
    const order = params.order, item = params.item;
    props.search({order: order, item: item});
    setOrderItemSearchMsg(`${order} / ${item}`);
    setShow(!show);
  }

  function refreshSearch(e) {
    if (e) e.stopPropagation();
    props.search({order: '', item: ''});
    setParams({order: '', item: ''});
    setOrderItemSearchMsg('');
  }

  function handleFocus() {
    clearTimeout(blurTimeoutRef.current);
  }

  function handleBlur() {
    clearTimeout(blurTimeoutRef.current);
    blurTimeoutRef.current = setTimeout(() => setShow(!show), 200);
  }

  function handleKeyPress(e) {
    if (e.key === 'Enter') {
      searchActivity();
    }
  }

  function handleChange(event) {
    setParams({...params,
      [event.target.name]: event.target.value
    });
  }

  return (
    <>
      <Popup anchor={anchor.current} show={show} style={{width: '340px'}}>
        {
          <div className="d-flex flex-column search-input" tabIndex="0" onFocus={handleFocus} onBlur={handleBlur}>
            <div className="px-3"><Label>{transLangKey("FP_ORDER")}</Label><Input name="order" value={params.order} onKeyPress={handleKeyPress} onChange={handleChange} ref={orderIdInputRef} /></div>
            <div className="px-3"><Label>{transLangKey("PRODUCT")}</Label><Input name="item" value={params.item} onKeyPress={handleKeyPress} onChange={handleChange} /></div>
            <div className="ms-auto mx-3">
              <button className="btn btn-notice ms-1" onClick={searchActivity} title={transLangKey("SEARCH")}>{transLangKey("SEARCH")}</button>
            </div>
          </div>
        }
      </Popup>
      <div className="col-md-auto my-auto">
        <div className={`activity-search d-flex align-items-center ${show ? "active" : ""}`} ref={anchor} onClick={() => setShow(!show)} style={props.style}>
          <span><Icon.Search /></span>
          <span>{orderItemSearchMsg ? orderItemSearchMsg : transLangKey("FP_ACTIVITY_SEARCH")}</span>
          <button className="btn hover-button ms-auto" onClick={refreshSearch}><Icon.X onClick={refreshSearch} size="20" /></button>
        </div>
      </div>
    </>
  )
}

ActivitySearch = forwardRef(ActivitySearch);
export default ActivitySearch;
