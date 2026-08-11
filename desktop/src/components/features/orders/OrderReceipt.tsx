import type { OrderReceiptData } from "@shared/presentation/order-receipt";
import {
  orderSourceLabels,
  orderStatusPresentation,
  orderTypeLabels,
  paymentMethodLabels,
  paymentStatusLabels,
} from "@shared/presentation/order";

function Separator({ strong = false }: { strong?: boolean }) {
  return <div className={strong ? "receipt-separator receipt-separator-strong" : "receipt-separator"} aria-hidden="true" />;
}

function Money({ value, receipt }: { value: number; receipt: OrderReceiptData }) {
  const amount = Number.isFinite(value) ? value : 0;
  return <bdi dir="ltr" className="receipt-number">{amount.toLocaleString(receipt.locale, { maximumFractionDigits: 2 })} {receipt.currency}</bdi>;
}

function Header({ receipt }: { receipt: OrderReceiptData }) {
  const cafe = receipt.cafe;
  return (
    <header className="receipt-header">
      {cafe.logo ? <img src={cafe.logo} alt={`شعار ${cafe.name}`} className="receipt-logo" onError={(event) => { event.currentTarget.style.display = "none"; }} /> : null}
      <h2>{cafe.name}</h2>
      {cafe.branchName ? <p>{cafe.branchName}</p> : null}
      {cafe.address ? <p>{cafe.address}</p> : null}
      {cafe.phone ? <p><bdi dir="ltr">{cafe.phone}</bdi></p> : null}
      {cafe.taxNumber ? <p>الرقم الضريبي: <bdi dir="ltr">{cafe.taxNumber}</bdi></p> : null}
    </header>
  );
}

function OrderInfo({ receipt }: { receipt: OrderReceiptData }) {
  const order = receipt.order;
  const createdAt = new Date(order.createdAt);
  const date = createdAt.toLocaleDateString(receipt.locale, { timeZone: receipt.timezone, year: "numeric", month: "2-digit", day: "2-digit" });
  const time = createdAt.toLocaleTimeString(receipt.locale, { timeZone: receipt.timezone, hour: "2-digit", minute: "2-digit" });
  return (
    <section className="receipt-info" aria-label="معلومات الطلب">
      <div><span>رقم الفاتورة</span><bdi dir="ltr">{order.number}</bdi></div>
      <div><span>التاريخ</span><bdi dir="ltr">{date} · {time}</bdi></div>
      {order.cashier ? <div><span>الكاشير</span><strong>{order.cashier}</strong></div> : null}
      <div><span>نوع الطلب</span><strong>{orderTypeLabels[order.type]}</strong></div>
      {order.source ? <div><span>مصدر الطلب</span><strong>{orderSourceLabels[order.source]}</strong></div> : null}
      {order.type === "TABLE" && order.tableNumber ? <div><span>الطاولة</span><bdi dir="ltr">T-{order.tableNumber}</bdi></div> : null}
      {order.customerName ? <div><span>العميل</span><strong>{order.customerName}</strong></div> : null}
      {order.customerPhone ? <div><span>الهاتف</span><bdi dir="ltr">{order.customerPhone}</bdi></div> : null}
      {order.deliveryAddress ? <div className="receipt-info-wide"><span>عنوان التوصيل</span><strong>{order.deliveryAddress}</strong></div> : null}
      {order.status === "CANCELLED" || order.status === "REFUNDED" ? <div className="receipt-state"><span>حالة الطلب</span><strong>{orderStatusPresentation[order.status].label}</strong></div> : null}
    </section>
  );
}

function Items({ receipt }: { receipt: OrderReceiptData }) {
  return (
    <section aria-label="عناصر الطلب">
      <div className="receipt-items-head"><span>الصنف</span><span>الكمية</span><span>الإجمالي</span></div>
      <div className="receipt-items">
        {receipt.items.map((item) => (
          <article className="receipt-item" key={item.id}>
            <div className="receipt-item-main">
              <div>
                <strong>{item.name}</strong>
                {item.variantName ? <small>{item.variantName}</small> : null}
                <small>سعر الوحدة: <Money value={item.unitPrice} receipt={receipt} /></small>
              </div>
              <bdi dir="ltr">× {item.quantity}</bdi>
              <Money value={item.total} receipt={receipt} />
            </div>
            {item.modifiers.map((modifier) => <div className="receipt-item-detail" key={modifier.id}><span>+ {modifier.name}</span>{modifier.amount ? <Money value={modifier.amount} receipt={receipt} /> : <span>—</span>}</div>)}
            {item.note ? <p className="receipt-item-note">ملاحظة: {item.note}</p> : null}
          </article>
        ))}
      </div>
    </section>
  );
}

function Totals({ receipt }: { receipt: OrderReceiptData }) {
  return (
    <section className="receipt-totals" aria-label="الإجماليات">
      {receipt.totals.map((row) => <div key={row.key}><span>{row.label}</span><Money value={row.amount} receipt={receipt} /></div>)}
      <Separator strong />
      <div className="receipt-grand-total"><span>الإجمالي</span><Money value={receipt.total} receipt={receipt} /></div>
      <Separator strong />
    </section>
  );
}

function Payment({ receipt }: { receipt: OrderReceiptData }) {
  const payment = receipt.payment;
  if (!payment.method && !payment.status && payment.paidAmount === undefined && payment.refundedAmount === undefined) return null;
  return (
    <section className="receipt-payment" aria-label="معلومات الدفع">
      {payment.method ? <div><span>طريقة الدفع</span><strong>{paymentMethodLabels[payment.method]}</strong></div> : null}
      {payment.status ? <div><span>حالة الدفع</span><strong>{paymentStatusLabels[payment.status]}</strong></div> : null}
      {payment.paidAmount !== undefined ? <div><span>المدفوع</span><Money value={payment.paidAmount} receipt={receipt} /></div> : null}
      {payment.cashReceived !== undefined ? <div><span>المبلغ المستلم</span><Money value={payment.cashReceived} receipt={receipt} /></div> : null}
      {payment.changeAmount !== undefined ? <div><span>الباقي</span><Money value={payment.changeAmount} receipt={receipt} /></div> : null}
      {payment.refundedAmount !== undefined && payment.refundedAmount > 0 ? <div><span>المسترجع</span><Money value={payment.refundedAmount} receipt={receipt} /></div> : null}
    </section>
  );
}

function Footer({ receipt }: { receipt: OrderReceiptData }) {
  const messages = [receipt.cafe.headerMessage, receipt.cafe.footerMessage].filter(
    (message, index, all): message is string => Boolean(message) && all.indexOf(message) === index,
  );
  return <footer className="receipt-footer"><Separator />{messages.length ? messages.map((message) => <p key={message}>{message}</p>) : <p>شكراً لزيارتكم</p>}</footer>;
}

export function OrderReceipt({ receipt }: { receipt: OrderReceiptData }) {
  return (
    <div className="receipt-preview" data-receipt-preview>
      <article className="thermal-receipt" data-receipt data-order-number={receipt.order.number} dir="rtl">
        <Header receipt={receipt} />
        <Separator />
        <OrderInfo receipt={receipt} />
        <Separator />
        <Items receipt={receipt} />
        <Separator />
        <Totals receipt={receipt} />
        <Payment receipt={receipt} />
        <Footer receipt={receipt} />
      </article>
    </div>
  );
}
