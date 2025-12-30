import React, { useState } from 'react';
import { X, Check, Loader2, AlertCircle } from 'lucide-react';
import { initiateCheckout, getFormattedPrice, getProducts, Product } from '@/services/paymentService';
import { triggerHaptic } from '@/services/hapticService';

interface StripePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const StripePaymentModal: React.FC<StripePaymentModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const products = getProducts();

  if (!isOpen) return null;

  const handleSelectProduct = async (product: Product) => {
    setError(null);
    setSelectedProduct(product);
    setLoading(true);

    try {
      await triggerHaptic();
      const result = await initiateCheckout(product, () => {
        setLoading(false);
        onSuccess?.();
        onClose();
      });

      if (!result.success) {
        setError(result.error || 'Payment failed');
        setLoading(false);
      }
      // If successful, Stripe redirects to checkout, so we don't need to handle here
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" 
         onClick={(e) => e.stopPropagation()}>
      <div className="bg-white border-2 border-black shadow-swiss max-w-2xl w-full relative flex flex-col animate-in fade-in zoom-in duration-200">
        <button 
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors disabled:opacity-50"
        >
          <X size={24} />
        </button>

        <div className="p-6 border-b-2 border-black">
          <h2 className="text-2xl font-extrabold uppercase tracking-tight text-black">Upgrade to Pro</h2>
          <p className="text-sm text-gray-600 mt-1">Unlock advanced analytics and forecasting</p>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <div className="p-6 space-y-4">
          {/* Product Tiers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className={`border-2 p-4 rounded cursor-pointer transition-all ${
                  selectedProduct?.id === product.id
                    ? 'border-black bg-black/5'
                    : 'border-gray-300 hover:border-black'
                }`}
                onClick={() => setSelectedProduct(product)}
              >
                <h3 className="font-bold uppercase text-lg text-black">{product.name}</h3>
                <p className="text-2xl font-extrabold text-black mt-2">${product.price.toFixed(2)}</p>
                <p className="text-xs text-gray-600 mt-1">{product.duration}</p>
                
                <div className="mt-4 space-y-2 text-xs text-gray-700">
                  {product.id === 'starter' && (
                    <>
                      <div className="flex items-center gap-2">
                        <Check size={14} className="text-green-600" />
                        <span>3 months access</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check size={14} className="text-green-600" />
                        <span>Basic analytics</span>
                      </div>
                    </>
                  )}
                  {product.id === 'pro' && (
                    <>
                      <div className="flex items-center gap-2">
                        <Check size={14} className="text-green-600" />
                        <span>1 year access</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check size={14} className="text-green-600" />
                        <span>Full analytics</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check size={14} className="text-green-600" />
                        <span>Cash forecasting</span>
                      </div>
                    </>
                  )}
                  {product.id === 'business' && (
                    <>
                      <div className="flex items-center gap-2">
                        <Check size={14} className="text-green-600" />
                        <span>Lifetime access</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check size={14} className="text-green-600" />
                        <span>All features</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check size={14} className="text-green-600" />
                        <span>Email support</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Purchase Button */}
          <div className="pt-4">
            <button
              onClick={() => selectedProduct && handleSelectProduct(selectedProduct)}
              disabled={!selectedProduct || loading}
              className={`w-full py-3 px-4 rounded font-bold uppercase transition-all text-sm ${
                selectedProduct && !loading
                  ? 'bg-black text-white hover:bg-gray-800 cursor-pointer'
                  : 'bg-gray-300 text-gray-600 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 size={18} className="animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                `Purchase ${selectedProduct?.name || 'Plan'}`
              )}
            </button>
          </div>

          <p className="text-center text-xs text-gray-500 mt-4">
            Secure payment processed by Stripe. Your transaction is encrypted and secure.
          </p>
        </div>

        <div className="p-4 border-t-2 border-black bg-gray-50 flex justify-end">
          <button 
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2 text-gray-700 font-bold uppercase text-sm hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
