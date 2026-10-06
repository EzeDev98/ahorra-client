import { ArrowLeft } from 'lucide-react';
import './FormScreen.css';
import ScreenContainer from './ScreenContainer.jsx';
import IconButton from '@shared/components/ui/IconButton.jsx';
import { cx } from '@shared/utils/classNames.js';

// Frame for a screen that is a form: back button, optional step indicator, title, description,
// the fields (children), then the actions (footer, usually block Buttons).
// Pass onSubmit and the body becomes a <form> (Enter submits; use a Button with type="submit").
// Without onSubmit the body is a plain <div>. step is a slot for <StepIndicator />. hero is a slot above the title
// (an illustration or large emoji); screens that do not pass it are unchanged.
export default function FormScreen({
  title,
  description,
  step,
  hero,
  onBack,
  backLabel = 'Back',
  onSubmit,
  footer,
  className,
  children,
}) {
  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(event);
  };

  const body = (
    <>
      <div className="ui-form-screen__fields">{children}</div>
      {footer && <div className="ui-form-screen__footer">{footer}</div>}
    </>
  );

  return (
    <ScreenContainer className={cx('ui-form-screen', className)}>
      <div className="ui-screen__bar">
        {onBack && <IconButton icon={ArrowLeft} label={backLabel} className="ui-form-screen__back" onClick={onBack} />}
      </div>
      <div className="ui-screen__group">
        {hero}
        {step}
        <header className="ui-form-screen__head">
          <h1 className="ui-form-screen__title">{title}</h1>
          {description && <p className="ui-form-screen__description">{description}</p>}
        </header>
        {onSubmit ? (
          <form className="ui-form-screen__body" noValidate onSubmit={handleSubmit}>
            {body}
          </form>
        ) : (
          <div className="ui-form-screen__body">{body}</div>
        )}
      </div>
    </ScreenContainer>
  );
}
