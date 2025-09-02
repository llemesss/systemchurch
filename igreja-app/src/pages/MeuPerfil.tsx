import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCelula } from '../contexts/CelulaContext';
import { apiCall, ENDPOINTS } from '../utils/api';
import toast from 'react-hot-toast';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  Box,
  Divider,
  Modal,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  gender: string;
  birthDate: string;
  birthCity: string;
  birthState: string;
  address: string;
  addressNumber: string;
  neighborhood: string;
  cep: string;
  reference: string;
  fatherName: string;
  motherName: string;
  maritalStatus: string;
  spouseName: string;
  education: string;
  profession: string;
  conversionDate: string;
  previousChurch: string;
  oikos_name: string;
  oikos_name_2: string;
}

interface Dependent {
  id?: number;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  observations?: string;
}

const MeuPerfil: React.FC = () => {
  const { user } = useAuth();
  const { cells, leaders } = useCelula();
  const [loading, setLoading] = useState(false);
  const [dependentModalOpen, setDependentModalOpen] = useState(false);
  const [dependents, setDependents] = useState<Dependent[]>([]);
  const [newDependent, setNewDependent] = useState<Dependent>({
    fullName: '',
    dateOfBirth: '',
    gender: '',
    observations: ''
  });

  const [profileData, setProfileData] = useState<ProfileData>({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    whatsapp: '',
    gender: '',
    birthDate: '',
    birthCity: '',
    birthState: '',
    address: '',
    addressNumber: '',
    neighborhood: '',
    cep: '',
    reference: '',
    fatherName: '',
    motherName: '',
    maritalStatus: '',
    spouseName: '',
    education: '',
    profession: '',
    conversionDate: '',
    previousChurch: '',
    oikos_name: '',
    oikos_name_2: ''
  });

  const brazilianStates = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  const educationLevels = [
    'Básico',
    'Fundamental',
    'Médio',
    'Superior',
    'Pós-graduação',
    'Mestrado',
    'Doutorado'
  ];

  const maritalStatusOptions = [
    'Solteiro(a)',
    'Casado(a)',
    'Divorciado(a)',
    'Viúvo(a)',
    'União Estável',
    'Outros'
  ];

  // Calcular idade baseada na data de nascimento
  const calculateAge = (birthDate: string): number => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // Buscar dados do perfil do usuário
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await apiCall(ENDPOINTS.PROFILE.COMPLETE, {
          method: 'GET'
        });
          // Mapear campos do backend para o frontend
          const mappedData = {
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            whatsapp: data.whatsapp || '',
            gender: data.gender || '',
            birthDate: data.date_of_birth || '',
            birthCity: data.birth_city || '',
            birthState: data.birth_state || '',
            address: data.address || '',
            addressNumber: data.address_number || '',
            neighborhood: data.neighborhood || '',
            cep: data.cep || '',
            reference: data.reference_point || '',
            fatherName: data.father_name || '',
            motherName: data.mother_name || '',
            maritalStatus: data.marital_status || '',
            spouseName: data.spouse_name || '',
            education: data.education || '',
            profession: data.profession || '',
            conversionDate: data.conversion_date || '',
            previousChurch: data.previous_church || '',
            oikos_name: data.oikos_name || '',
            oikos_name_2: data.oikos_name_2 || ''
          };
          setProfileData(prev => ({ ...prev, ...mappedData }));
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
      }
    };

    fetchProfile();
  }, []);

  // Buscar dependentes
  useEffect(() => {
    const fetchDependents = async () => {
      try {
        const data = await apiCall(ENDPOINTS.DEPENDENTS.LIST, {
          method: 'GET'
        });
        setDependents(data);
      } catch (error) {
        console.error('Erro ao carregar dependentes:', error);
      }
    };

    fetchDependents();
  }, []);

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      // Mapear campos do frontend para o backend
      const backendData = {
        name: profileData.name,
        phone: profileData.phone,
        whatsapp: profileData.whatsapp,
        gender: profileData.gender,
        date_of_birth: profileData.birthDate,
        birth_city: profileData.birthCity,
        birth_state: profileData.birthState,
        address: profileData.address,
        address_number: profileData.addressNumber,
        neighborhood: profileData.neighborhood,
        cep: profileData.cep,
        reference_point: profileData.reference,
        father_name: profileData.fatherName,
        mother_name: profileData.motherName,
        marital_status: profileData.maritalStatus,
        spouse_name: profileData.spouseName,
        education: profileData.education,
        profession: profileData.profession,
        conversion_date: profileData.conversionDate,
        previous_church: profileData.previousChurch,
        oikos_name: profileData.oikos_name,
        oikos_name_2: profileData.oikos_name_2
      };
      
      await apiCall(ENDPOINTS.PROFILE.UPDATE, {
        method: 'PUT',
        body: JSON.stringify(backendData)
      });

      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      toast.error('Erro ao salvar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDependent = async () => {
    try {
      const savedDependent = await apiCall(ENDPOINTS.DEPENDENTS.CREATE, {
        method: 'POST',
        body: JSON.stringify(newDependent)
      });

      setDependents(prev => [...prev, savedDependent]);
      setNewDependent({ fullName: '', dateOfBirth: '', gender: '', observations: '' });
      setDependentModalOpen(false);
      toast.success('Dependente cadastrado com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar dependente:', error);
      toast.error('Erro ao salvar dependente');
    }
  };

  // Encontrar célula e líder do usuário
  const userCell = cells?.find(cell => cell.id === user?.cell_id);
  const userLeader = leaders?.find(leader => leader.id === userCell?.leader_id);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 4, textAlign: 'center' }}>
          Meu Perfil
        </Typography>

        <Grid container spacing={3}>
          {/* Identificação do Usuário */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon />
              Identificação do Usuário
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Nome Completo"
              variant="outlined"
              fullWidth
              margin="normal"
              value={profileData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Email"
              variant="outlined"
              fullWidth
              margin="normal"
              value={profileData.email}
              disabled
              helperText="Email não pode ser alterado"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Célula"
              variant="outlined"
              fullWidth
              margin="normal"
              value={userCell?.cell_number ? `Célula ${userCell.cell_number}` : 'Não definida'}
              disabled
              helperText="Célula atual"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Líder"
              variant="outlined"
              fullWidth
              margin="normal"
              value={userCell?.leader_1?.name || 'Não definido'}
              disabled
              helperText="Líder da sua célula"
            />
          </Grid>

          {/* Dados Pessoais */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Dados Pessoais
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Telefone"
              variant="outlined"
              fullWidth
              margin="normal"
              value={profileData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="(11) 99999-9999"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="WhatsApp"
              variant="outlined"
              fullWidth
              margin="normal"
              value={profileData.whatsapp}
              onChange={(e) => handleInputChange('whatsapp', e.target.value)}
              placeholder="(11) 99999-9999"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl component="fieldset" margin="normal">
              <FormLabel component="legend">Sexo</FormLabel>
              <RadioGroup
                row
                value={profileData.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
              >
                <FormControlLabel value="M" control={<Radio />} label="Masculino" />
                <FormControlLabel value="F" control={<Radio />} label="Feminino" />
              </RadioGroup>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Data de Nascimento"
              type="date"
              variant="outlined"
              fullWidth
              margin="normal"
              value={profileData.birthDate}
              onChange={(e) => handleInputChange('birthDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Idade"
              variant="outlined"
              fullWidth
              margin="normal"
              value={calculateAge(profileData.birthDate) || ''}
              disabled
              helperText="Calculada automaticamente"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Cidade que nasceu"
              variant="outlined"
              fullWidth
              margin="normal"
              value={profileData.birthCity}
              onChange={(e) => handleInputChange('birthCity', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>UF</InputLabel>
              <Select
                value={profileData.birthState}
                onChange={(e) => handleInputChange('birthState', e.target.value)}
                label="UF"
              >
                {brazilianStates.map((state) => (
                  <MenuItem key={state} value={state}>
                    {state}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Endereço */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Endereço
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={12} md={8}>
            <TextField
              label="Endereço"
              variant="outlined"
              fullWidth
              margin="normal"
              value={profileData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              label="Nº"
              variant="outlined"
              fullWidth
              margin="normal"
              value={profileData.addressNumber}
              onChange={(e) => handleInputChange('addressNumber', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Bairro"
              variant="outlined"
              fullWidth
              margin="normal"
              value={profileData.neighborhood}
              onChange={(e) => handleInputChange('neighborhood', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="CEP"
              variant="outlined"
              fullWidth
              margin="normal"
              value={profileData.cep}
              onChange={(e) => handleInputChange('cep', e.target.value)}
              placeholder="00000-000"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Ponto de Referência"
              variant="outlined"
              fullWidth
              margin="normal"
              value={profileData.reference}
              onChange={(e) => handleInputChange('reference', e.target.value)}
            />
          </Grid>

          {/* Família e Estado Civil */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <FamilyRestroomIcon />
              Família e Estado Civil
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Filiação - Pai"
              variant="outlined"
              fullWidth
              margin="normal"
              value={profileData.fatherName}
              onChange={(e) => handleInputChange('fatherName', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Mãe"
              variant="outlined"
              fullWidth
              margin="normal"
              value={profileData.motherName}
              onChange={(e) => handleInputChange('motherName', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Estado Civil</InputLabel>
              <Select
                value={profileData.maritalStatus}
                onChange={(e) => handleInputChange('maritalStatus', e.target.value)}
                label="Estado Civil"
              >
                {maritalStatusOptions.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {profileData.maritalStatus === 'Casado(a)' && (
            <Grid item xs={12} md={6}>
              <TextField
                label="Nome do Cônjuge"
                variant="outlined"
                fullWidth
                margin="normal"
                value={profileData.spouseName}
                onChange={(e) => handleInputChange('spouseName', e.target.value)}
              />
            </Grid>
          )}

          {/* Educação e Profissão */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Educação e Profissão
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Escolaridade</InputLabel>
              <Select
                value={profileData.education}
                onChange={(e) => handleInputChange('education', e.target.value)}
                label="Escolaridade"
              >
                {educationLevels.map((level) => (
                  <MenuItem key={level} value={level}>
                    {level}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Profissão"
              variant="outlined"
              fullWidth
              margin="normal"
              value={profileData.profession}
              onChange={(e) => handleInputChange('profession', e.target.value)}
            />
          </Grid>

          {/* Informações da Igreja */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Informações da Igreja
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Data de Conversão/Reconciliação"
              type="date"
              variant="outlined"
              fullWidth
              margin="normal"
              value={profileData.conversionDate}
              onChange={(e) => handleInputChange('conversionDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Se transferido(a), qual Igreja?"
              variant="outlined"
              fullWidth
              margin="normal"
              value={profileData.previousChurch}
              onChange={(e) => handleInputChange('previousChurch', e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Nome do 1º Oikós (opcional)"
              variant="outlined"
              fullWidth
              margin="normal"
              value={profileData.oikos_name}
              onChange={(e) => handleInputChange('oikos_name', e.target.value)}
              placeholder="Nome da pessoa que você quer alcançar"
              helperText="Pessoa que você está orando para trazer para Cristo"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Nome do 2º Oikós (opcional)"
              variant="outlined"
              fullWidth
              margin="normal"
              value={profileData.oikos_name_2}
              onChange={(e) => handleInputChange('oikos_name_2', e.target.value)}
              placeholder="Nome da segunda pessoa que você quer alcançar"
              helperText="Segunda pessoa que você está orando para trazer para Cristo"
            />
          </Grid>

          {/* Botões de Ação */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4 }}>
              <Button
                variant="contained"
                onClick={handleSaveProfile}
                disabled={loading}
                size="large"
              >
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
              
              <Button
                variant="outlined"
                onClick={() => setDependentModalOpen(true)}
                size="large"
              >
                Cadastrar Filho(a)
              </Button>
            </Box>
          </Grid>

          {/* Lista de Dependentes */}
          {dependents.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Dependentes Cadastrados
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {dependents.map((dependent, index) => (
                <Paper key={dependent.id || index} elevation={1} sx={{ p: 2, mb: 2 }}>
                  <Typography variant="subtitle1">{dependent.fullName}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Nascimento: {new Date(dependent.dateOfBirth).toLocaleDateString('pt-BR')} | 
                    Sexo: {dependent.gender === 'M' ? 'Masculino' : 'Feminino'} | 
                    Idade: {calculateAge(dependent.dateOfBirth)} anos
                  </Typography>
                  {dependent.observations && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Observações: {dependent.observations}
                    </Typography>
                  )}
                </Paper>
              ))}
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Modal para Cadastrar Dependente */}
      <Modal
        open={dependentModalOpen}
        onClose={() => setDependentModalOpen(false)}
        aria-labelledby="dependent-modal-title"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: 500 },
          bgcolor: 'background.paper',
          boxShadow: 24,
          borderRadius: 2,
          p: 4
        }}>
          <DialogTitle id="dependent-modal-title">
            Cadastrar Filho(a)
          </DialogTitle>
          
          <DialogContent>
            <TextField
              label="Nome Completo do Filho(a)"
              variant="outlined"
              fullWidth
              margin="normal"
              value={newDependent.fullName}
              onChange={(e) => setNewDependent(prev => ({ ...prev, fullName: e.target.value }))}
            />
            
            <TextField
              label="Data de Nascimento"
              type="date"
              variant="outlined"
              fullWidth
              margin="normal"
              value={newDependent.dateOfBirth}
              onChange={(e) => setNewDependent(prev => ({ ...prev, dateOfBirth: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
            
            <FormControl component="fieldset" margin="normal" fullWidth>
              <FormLabel component="legend">Sexo</FormLabel>
              <RadioGroup
                row
                value={newDependent.gender}
                onChange={(e) => setNewDependent(prev => ({ ...prev, gender: e.target.value }))}
              >
                <FormControlLabel value="M" control={<Radio />} label="Masculino" />
                <FormControlLabel value="F" control={<Radio />} label="Feminino" />
              </RadioGroup>
            </FormControl>
            
            <TextField
              label="Observações (Opcional)"
              variant="outlined"
              fullWidth
              margin="normal"
              multiline
              rows={3}
              value={newDependent.observations}
              onChange={(e) => setNewDependent(prev => ({ ...prev, observations: e.target.value }))}
            />
          </DialogContent>
          
          <DialogActions>
            <Button onClick={() => setDependentModalOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveDependent}
              variant="contained"
              disabled={!newDependent.fullName || !newDependent.dateOfBirth || !newDependent.gender}
            >
              Salvar
            </Button>
          </DialogActions>
        </Box>
      </Modal>
    </Container>
  );
};

export default MeuPerfil;