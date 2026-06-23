import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Analisador Léxico');
  });

  it('should register epsilon as an empty token', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    app.newToken = '';
    app.addToken();

    expect(app.tokens).toEqual(['']);
    expect(app.tokenError).toBe('');
  });

  it('should accept epsilon and reset transitions when it was registered', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    app.tokens = [''];
    app.buildAutomato();
    app.currentValidationState = 2;
    app.validationSteps = [{ symbol: 'a', to: 1 }];

    app.finalizeValidation();

    expect(app.currentValidationState).toBe(0);
    expect(app.validationSteps).toEqual([]);
    expect(app.validationResult).toContain('TOKEN VÁLIDO: "ε"');
    expect(app.validTokensRecognized).toContain('ε');
    expect(app.isValidating).toBeFalse();
  });

  it('should reject epsilon when it was not registered', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    app.tokens = ['a'];
    app.buildAutomato();
    app.currentValidationState = 1;
    app.validationSteps = [{ symbol: 'a', to: 1 }];

    app.finalizeValidation();

    expect(app.currentValidationState).toBe(0);
    expect(app.validationSteps).toEqual([]);
    expect(app.validationResult).toContain('TOKEN INVÁLIDO');
    expect(app.validTokensRecognized).not.toContain('ε');
    expect(app.isValidating).toBeFalse();
  });
});
