
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface BankAccount {
  id: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  is_verified: boolean;
}

interface Bank {
  bank_name: string;
  bank_code: string;
}

const BankAccountSelector = ({ onAccountSelected }: { onAccountSelected: (account: BankAccount) => void }) => {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchBankAccounts();
      fetchBanks();
    }
  }, [user]);

  const fetchBankAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;
      setBankAccounts(data || []);
    } catch (error: any) {
      console.error("Error fetching bank accounts:", error);
    }
  };

  const fetchBanks = async () => {
    try {
      const { data, error } = await supabase.rpc('get_nigerian_banks', { search_term: searchTerm });
      if (error) throw error;
      setBanks(data || []);
    } catch (error: any) {
      console.error("Error fetching banks:", error);
    }
  };

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      fetchBanks();
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm]);

  const handleAddBankAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedBank || !accountNumber || !accountName) return;

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('bank_accounts')
        .insert({
          user_id: user.id,
          bank_name: selectedBank,
          account_number: accountNumber,
          account_name: accountName
        })
        .select()
        .single();

      if (error) throw error;

      setBankAccounts([...bankAccounts, data]);
      setShowAddForm(false);
      setSelectedBank('');
      setAccountNumber('');
      setAccountName('');
      
      toast({
        title: "Bank account added successfully",
        description: "Your bank account has been linked to your profile",
      });
    } catch (error: any) {
      toast({
        title: "Error adding bank account",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBanks = banks.filter(bank => 
    bank.bank_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (bankAccounts.length === 0 && !showAddForm) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Link Bank Account</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">You need to link a bank account before making withdrawals.</p>
          <Button onClick={() => setShowAddForm(true)}>Add Bank Account</Button>
        </CardContent>
      </Card>
    );
  }

  if (showAddForm) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Add Bank Account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddBankAccount} className="space-y-4">
            <div>
              <Label htmlFor="bankSearch">Bank Name</Label>
              <Input
                id="bankSearch"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for your bank..."
              />
              {searchTerm && (
                <div className="mt-2 max-h-40 overflow-y-auto border rounded">
                  {filteredBanks.map((bank) => (
                    <div
                      key={bank.bank_code}
                      className="p-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setSelectedBank(bank.bank_name);
                        setSearchTerm(bank.bank_name);
                      }}
                    >
                      {bank.bank_name}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div>
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="10-digit account number"
                maxLength={10}
                pattern="[0-9]{10}"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="accountName">Account Name</Label>
              <Input
                id="accountName"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="Account holder's name"
                required
              />
            </div>
            
            <div className="flex space-x-2">
              <Button type="submit" disabled={isLoading || !selectedBank}>
                {isLoading ? "Adding..." : "Add Account"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Bank Account</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {bankAccounts.map((account) => (
            <div
              key={account.id}
              className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
              onClick={() => onAccountSelected(account)}
            >
              <div className="font-medium">{account.bank_name}</div>
              <div className="text-sm text-gray-600">
                {account.account_number} - {account.account_name}
              </div>
            </div>
          ))}
          <Button variant="outline" onClick={() => setShowAddForm(true)}>
            Add Another Account
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BankAccountSelector;
